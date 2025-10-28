import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbRun, dbGet, dbAll } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 回答作成
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { questionId, content, sourceInfo } = req.body;

    if (!questionId || !content) {
      return res.status(400).json({ error: 'Question ID and content are required' });
    }

    // 質問の存在確認
    const question = await dbGet('SELECT * FROM questions WHERE id = ?', [questionId]);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const answerId = uuidv4();
    await dbRun(
      `INSERT INTO answers (id, question_id, user_id, content, source_info)
       VALUES (?, ?, ?, ?, ?)`,
      [answerId, questionId, req.user.userId, content, sourceInfo]
    );

    const answer = await dbGet(
      `SELECT a.*, u.username, u.display_name, u.avatar_url
       FROM answers a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.id = ?`,
      [answerId]
    );

    res.status(201).json(answer);
  } catch (error) {
    console.error('Error creating answer:', error);
    res.status(500).json({ error: 'Failed to create answer' });
  }
});

// 回答選択（質問者のみ）
router.post('/:id/select', authenticateToken, async (req, res) => {
  try {
    const answerId = req.params.id;

    // 回答の取得
    const answer = await dbGet('SELECT * FROM answers WHERE id = ?', [answerId]);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    // 質問の取得と所有者確認
    const question = await dbGet('SELECT * FROM questions WHERE id = ?', [answer.question_id]);
    if (question.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Only the question owner can select answers' });
    }

    // 他の選択済み回答の選択解除
    await dbRun(
      'UPDATE answers SET is_selected = 0 WHERE question_id = ?',
      [answer.question_id]
    );

    // この回答を選択
    await dbRun('UPDATE answers SET is_selected = 1 WHERE id = ?', [answerId]);

    // 質問のステータスを更新
    await dbRun(
      'UPDATE questions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['answered', answer.question_id]
    );

    const updatedAnswer = await dbGet(
      `SELECT a.*, u.username, u.display_name, u.avatar_url
       FROM answers a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.id = ?`,
      [answerId]
    );

    res.json(updatedAnswer);
  } catch (error) {
    console.error('Error selecting answer:', error);
    res.status(500).json({ error: 'Failed to select answer' });
  }
});

// 回答への投票
router.post('/:id/upvote', authenticateToken, async (req, res) => {
  try {
    const answerId = req.params.id;

    const answer = await dbGet('SELECT * FROM answers WHERE id = ?', [answerId]);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    await dbRun(
      'UPDATE answers SET upvotes = upvotes + 1 WHERE id = ?',
      [answerId]
    );

    const updatedAnswer = await dbGet(
      `SELECT a.*, u.username, u.display_name, u.avatar_url
       FROM answers a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.id = ?`,
      [answerId]
    );

    res.json(updatedAnswer);
  } catch (error) {
    console.error('Error upvoting answer:', error);
    res.status(500).json({ error: 'Failed to upvote answer' });
  }
});

// 回答更新
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { content, sourceInfo } = req.body;
    const answerId = req.params.id;

    const answer = await dbGet('SELECT * FROM answers WHERE id = ?', [answerId]);
    
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    if (answer.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to update this answer' });
    }

    const updates = [];
    const params = [];

    if (content) {
      updates.push('content = ?');
      params.push(content);
    }
    if (sourceInfo !== undefined) {
      updates.push('source_info = ?');
      params.push(sourceInfo);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(answerId);

    await dbRun(
      `UPDATE answers SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const updatedAnswer = await dbGet(
      `SELECT a.*, u.username, u.display_name, u.avatar_url
       FROM answers a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.id = ?`,
      [answerId]
    );

    res.json(updatedAnswer);
  } catch (error) {
    console.error('Error updating answer:', error);
    res.status(500).json({ error: 'Failed to update answer' });
  }
});

export default router;
