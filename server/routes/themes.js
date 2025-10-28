import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbRun, dbGet, dbAll } from '../database.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// 全テーマ取得
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category } = req.query;
    let query = `
      SELECT t.*, u.username as creator_username, u.display_name as creator_name,
             COUNT(DISTINCT q.id) as question_count
      FROM themes t
      LEFT JOIN users u ON t.created_by = u.id
      LEFT JOIN questions q ON t.id = q.theme_id
    `;
    
    const params = [];
    if (category) {
      query += ' WHERE t.category = ?';
      params.push(category);
    }
    
    query += ' GROUP BY t.id ORDER BY t.created_at DESC';
    
    const themes = await dbAll(query, params);
    res.json(themes);
  } catch (error) {
    console.error('Error fetching themes:', error);
    res.status(500).json({ error: 'Failed to fetch themes' });
  }
});

// テーマ詳細取得
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const theme = await dbGet(
      `SELECT t.*, u.username as creator_username, u.display_name as creator_name
       FROM themes t
       LEFT JOIN users u ON t.created_by = u.id
       WHERE t.id = ?`,
      [req.params.id]
    );

    if (!theme) {
      return res.status(404).json({ error: 'Theme not found' });
    }

    // テーマに関連する質問を取得
    const questions = await dbAll(
      `SELECT q.*, u.username, u.display_name,
              COUNT(DISTINCT a.id) as answer_count
       FROM questions q
       LEFT JOIN users u ON q.user_id = u.id
       LEFT JOIN answers a ON q.id = a.question_id
       WHERE q.theme_id = ?
       GROUP BY q.id
       ORDER BY q.created_at DESC`,
      [req.params.id]
    );

    res.json({ ...theme, questions });
  } catch (error) {
    console.error('Error fetching theme:', error);
    res.status(500).json({ error: 'Failed to fetch theme' });
  }
});

// テーマ作成
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const themeId = uuidv4();
    await dbRun(
      `INSERT INTO themes (id, title, description, category, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [themeId, title, description, category, req.user.userId]
    );

    const theme = await dbGet('SELECT * FROM themes WHERE id = ?', [themeId]);
    res.status(201).json(theme);
  } catch (error) {
    console.error('Error creating theme:', error);
    res.status(500).json({ error: 'Failed to create theme' });
  }
});

export default router;
