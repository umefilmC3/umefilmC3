import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbRun, dbGet, dbAll } from '../database.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// 全質問取得
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { theme_id, status } = req.query;
    let query = `
      SELECT q.*, u.username, u.display_name, u.avatar_url,
             t.title as theme_title,
             COUNT(DISTINCT a.id) as answer_count
      FROM questions q
      LEFT JOIN users u ON q.user_id = u.id
      LEFT JOIN themes t ON q.theme_id = t.id
      LEFT JOIN answers a ON q.id = a.question_id
    `;
    
    const conditions = [];
    const params = [];
    
    if (theme_id) {
      conditions.push('q.theme_id = ?');
      params.push(theme_id);
    }
    
    if (status) {
      conditions.push('q.status = ?');
      params.push(status);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' GROUP BY q.id ORDER BY q.created_at DESC';
    
    const questions = await dbAll(query, params);
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// 質問詳細取得
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const question = await dbGet(
      `SELECT q.*, u.username, u.display_name, u.avatar_url,
              t.title as theme_title, t.category as theme_category
       FROM questions q
       LEFT JOIN users u ON q.user_id = u.id
       LEFT JOIN themes t ON q.theme_id = t.id
       WHERE q.id = ?`,
      [req.params.id]
    );

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // 回答を取得
    const answers = await dbAll(
      `SELECT a.*, u.username, u.display_name, u.avatar_url
       FROM answers a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.question_id = ?
       ORDER BY a.is_selected DESC, a.upvotes DESC, a.created_at ASC`,
      [req.params.id]
    );

    res.json({ ...question, answers });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

// 質問作成
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { themeId, title, content, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const questionId = uuidv4();
    const tagsStr = Array.isArray(tags) ? JSON.stringify(tags) : tags;
    
    await dbRun(
      `INSERT INTO questions (id, theme_id, user_id, title, content, tags, status)
       VALUES (?, ?, ?, ?, ?, ?, 'open')`,
      [questionId, themeId, req.user.userId, title, content, tagsStr]
    );

    const question = await dbGet(
      `SELECT q.*, u.username, u.display_name
       FROM questions q
       LEFT JOIN users u ON q.user_id = u.id
       WHERE q.id = ?`,
      [questionId]
    );

    res.status(201).json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// 質問更新
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, content, tags, status } = req.body;
    const questionId = req.params.id;

    // 質問の所有者確認
    const question = await dbGet('SELECT * FROM questions WHERE id = ?', [questionId]);
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    if (question.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to update this question' });
    }

    const updates = [];
    const params = [];

    if (title) {
      updates.push('title = ?');
      params.push(title);
    }
    if (content) {
      updates.push('content = ?');
      params.push(content);
    }
    if (tags) {
      updates.push('tags = ?');
      params.push(Array.isArray(tags) ? JSON.stringify(tags) : tags);
    }
    if (status) {
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(questionId);

    await dbRun(
      `UPDATE questions SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const updatedQuestion = await dbGet(
      `SELECT q.*, u.username, u.display_name
       FROM questions q
       LEFT JOIN users u ON q.user_id = u.id
       WHERE q.id = ?`,
      [questionId]
    );

    res.json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

export default router;
