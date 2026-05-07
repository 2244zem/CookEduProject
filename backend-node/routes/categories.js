/**
 * ============================================
 * Category Routes — CRUD Kategori
 * ============================================
 */

const express = require('express');
const db = require('../config/database');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/categories
 * List semua kategori + jumlah resep
 */
router.get('/', async (req, res) => {
  try {
    const [categories] = await db.query(
      `SELECT c.*, COUNT(r.id) as recipe_count
       FROM categories c
       LEFT JOIN recipes r ON c.id = r.category_id
       GROUP BY c.id
       ORDER BY c.name`
    );

    res.json({ success: true, data: categories });
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

/**
 * POST /api/categories
 * Tambah kategori baru (admin only)
 */
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, image_url } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi' });
    }

    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const [result] = await db.query(
      'INSERT INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)',
      [name, slug, description || '', image_url || '']
    );

    res.status(201).json({
      success: true,
      message: 'Kategori berhasil ditambahkan',
      data: { id: result.insertId, name, slug }
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Kategori sudah ada' });
    }
    console.error('Create category error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

/**
 * PUT /api/categories/:id
 * Update kategori (admin only)
 */
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image_url } = req.body;

    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const [result] = await db.query(
      'UPDATE categories SET name=?, slug=?, description=?, image_url=? WHERE id=?',
      [name, slug, description || '', image_url || '', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    res.json({ success: true, message: 'Kategori berhasil diupdate' });
  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

/**
 * DELETE /api/categories/:id
 * Hapus kategori (admin only)
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    res.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

module.exports = router;
