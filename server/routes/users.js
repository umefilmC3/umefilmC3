import express from 'express';
import { dbGet, dbAll } from '../database.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// ユーザープロフィール取得
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const user = await dbGet(
      `SELECT id, username, email, display_name, bio, age_group, user_type, avatar_url, created_at
       FROM users WHERE id = ?`,
      [req.params.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // ユーザーの統計情報を取得
    const questions = await dbAll(
      'SELECT * FROM questions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [req.params.id]
    );

    const answers = await dbAll(
      'SELECT * FROM answers WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [req.params.id]
    );

    const stats = {
      questionCount: questions.length,
      answerCount: answers.length,
      totalUpvotes: answers.reduce((sum, a) => sum + (a.upvotes || 0), 0)
    };

    res.json({ ...user, stats, recentQuestions: questions, recentAnswers: answers });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// 現在のユーザー情報取得
router.get('/me/profile', authenticateToken, async (req, res) => {
  try {
    const user = await dbGet(
      `SELECT id, username, email, display_name, bio, age_group, user_type, avatar_url, created_at
       FROM users WHERE id = ?`,
      [req.user.userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

export default router;
