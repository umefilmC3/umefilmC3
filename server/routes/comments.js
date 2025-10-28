import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbRun, dbGet, dbAll } from '../database.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// コメント一覧取得（親タイプと親IDで絞り込み）
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { parent_type, parent_id } = req.query;

    if (!parent_type || !parent_id) {
      return res.status(400).json({ error: 'parent_type and parent_id are required' });
    }

    const comments = await dbAll(
      `SELECT c.*, u.username, u.display_name, u.avatar_url
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.parent_type = ? AND c.parent_id = ?
       ORDER BY c.created_at ASC`,
      [parent_type, parent_id]
    );

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// コメント投稿
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { parent_type, parent_id, content } = req.body;

    if (!parent_type || !parent_id || !content) {
      return res.status(400).json({ 
        error: 'parent_type, parent_id, and content are required' 
      });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({ error: 'Content cannot be empty' });
    }

    // 親オブジェクトの存在確認
    let parentExists = false;
    if (parent_type === 'question') {
      const question = await dbGet('SELECT id FROM questions WHERE id = ?', [parent_id]);
      parentExists = !!question;
    } else if (parent_type === 'answer') {
      const answer = await dbGet('SELECT id FROM answers WHERE id = ?', [parent_id]);
      parentExists = !!answer;
    }

    if (!parentExists) {
      return res.status(404).json({ error: 'Parent object not found' });
    }

    const commentId = uuidv4();
    await dbRun(
      `INSERT INTO comments (id, parent_type, parent_id, user_id, content)
       VALUES (?, ?, ?, ?, ?)`,
      [commentId, parent_type, parent_id, req.user.userId, content]
    );

    // 作成されたコメントを取得
    const comment = await dbGet(
      `SELECT c.*, u.username, u.display_name, u.avatar_url
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [commentId]
    );

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// コメント更新
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // コメントの所有者確認
    const comment = await dbGet('SELECT * FROM comments WHERE id = ?', [req.params.id]);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to update this comment' });
    }

    await dbRun(
      'UPDATE comments SET content = ? WHERE id = ?',
      [content, req.params.id]
    );

    const updatedComment = await dbGet(
      `SELECT c.*, u.username, u.display_name, u.avatar_url
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [req.params.id]
    );

    res.json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// コメント削除
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // コメントの所有者確認
    const comment = await dbGet('SELECT * FROM comments WHERE id = ?', [req.params.id]);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    await dbRun('DELETE FROM comments WHERE id = ?', [req.params.id]);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router;
