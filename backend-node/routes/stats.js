/**
 * Stats Routes — Admin Dashboard Statistics
 */
const express = require('express');
const db = require('../config/database');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const [[{ total_recipes }]] = await db.query('SELECT COUNT(*) as total_recipes FROM recipes');
    const [[{ total_users }]] = await db.query('SELECT COUNT(*) as total_users FROM users');
    const [[{ total_categories }]] = await db.query('SELECT COUNT(*) as total_categories FROM categories');

    const [recent_recipes] = await db.query(
      `SELECT r.*, c.name as category_name FROM recipes r
       LEFT JOIN categories c ON r.category_id = c.id
       ORDER BY r.created_at DESC LIMIT 5`
    );

    const [monthly_data] = await db.query(
      `SELECT DATE_FORMAT(created_at, '%b') as name, COUNT(*) as resep
       FROM recipes WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%b')
       ORDER BY DATE_FORMAT(created_at, '%Y-%m')`
    );

    const [category_data] = await db.query(
      `SELECT c.name, COUNT(r.id) as count FROM categories c
       LEFT JOIN recipes r ON c.id = r.category_id
       GROUP BY c.id, c.name ORDER BY count DESC`
    );

    res.json({
      success: true,
      data: { total_recipes, total_users, total_categories, recent_recipes, monthly_data, category_data }
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

module.exports = router;
