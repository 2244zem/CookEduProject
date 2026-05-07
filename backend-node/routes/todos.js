/**
 * ============================================
 * Todo Routes — CRUD Daftar Belanja
 * ============================================
 */

const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/todos
 * List semua todo lists milik user yang login
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const [lists] = await db.query(
      'SELECT * FROM todo_lists WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    // Fetch items untuk setiap list
    for (let list of lists) {
      const [items] = await db.query(
        'SELECT * FROM todo_items WHERE todo_list_id = ?',
        [list.id]
      );
      list.items = items;
    }

    res.json({ success: true, data: lists });
  } catch (err) {
    console.error('Get todos error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

/**
 * POST /api/todos
 * Buat todo list baru dengan items
 */
router.post('/', authenticate, async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { title, items } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Judul wajib diisi' });
    }

    const [result] = await conn.query(
      'INSERT INTO todo_lists (user_id, title) VALUES (?, ?)',
      [req.user.id, title]
    );

    const listId = result.insertId;

    if (items && Array.isArray(items)) {
      for (const item of items) {
        await conn.query(
          'INSERT INTO todo_items (todo_list_id, item_name, quantity) VALUES (?, ?, ?)',
          [listId, item.item_name || item.name, item.quantity || '']
        );
      }
    }

    await conn.commit();
    res.status(201).json({
      success: true,
      message: 'Daftar belanja berhasil dibuat',
      data: { id: listId }
    });
  } catch (err) {
    await conn.rollback();
    console.error('Create todo error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  } finally {
    conn.release();
  }
});

/**
 * PATCH /api/todos/items/:id
 * Toggle checklist item
 */
router.patch('/items/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      'UPDATE todo_items SET is_checked = NOT is_checked WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Item tidak ditemukan' });
    }

    res.json({ success: true, message: 'Item berhasil diupdate' });
  } catch (err) {
    console.error('Toggle todo item error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

/**
 * DELETE /api/todos/:id
 * Hapus todo list
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      'DELETE FROM todo_lists WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Daftar tidak ditemukan' });
    }

    res.json({ success: true, message: 'Daftar berhasil dihapus' });
  } catch (err) {
    console.error('Delete todo error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

module.exports = router;
