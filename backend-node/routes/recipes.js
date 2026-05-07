/**
 * ============================================
 * Recipe Routes — CRUD Resep + Ingredients + Steps
 * ============================================
 */

const express = require('express');
const db = require('../config/database');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/recipes
 * List semua resep (paginated, filter by category)
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, per_page = 12, category, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(per_page);
    const limit = parseInt(per_page);

    let where = [];
    let params = [];

    if (category) {
      where.push('r.category_id = ?');
      params.push(parseInt(category));
    }
    if (search) {
      where.push('(r.title LIKE ? OR r.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

    // Count total
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM recipes r ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Fetch recipes
    const [recipes] = await db.query(
      `SELECT r.*, c.name as category_name, u.name as author_name
       FROM recipes r
       LEFT JOIN categories c ON r.category_id = c.id
       LEFT JOIN users u ON r.user_id = u.id
       ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: recipes,
      meta: {
        total,
        page: parseInt(page),
        per_page: limit,
        total_pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Get recipes error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

/**
 * GET /api/recipes/:slug
 * Detail resep + ingredients + steps
 */
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const [recipes] = await db.query(
      `SELECT r.*, c.name as category_name, u.name as author_name
       FROM recipes r
       LEFT JOIN categories c ON r.category_id = c.id
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.slug = ?`,
      [slug]
    );

    if (recipes.length === 0) {
      return res.status(404).json({ success: false, message: 'Resep tidak ditemukan' });
    }

    const recipe = recipes[0];

    // Fetch ingredients
    const [ingredients] = await db.query(
      'SELECT * FROM ingredients WHERE recipe_id = ? ORDER BY sort_order',
      [recipe.id]
    );

    // Fetch steps
    const [steps] = await db.query(
      'SELECT * FROM recipe_steps WHERE recipe_id = ? ORDER BY step_number',
      [recipe.id]
    );

    recipe.ingredients = ingredients;
    recipe.steps = steps;

    res.json({ success: true, data: recipe });
  } catch (err) {
    console.error('Get recipe detail error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

/**
 * POST /api/recipes
 * Tambah resep baru (auth required)
 */
router.post('/', authenticate, async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { title, category_id, description, image_url, prep_time, cook_time, servings, difficulty, ingredients, steps } = req.body;

    if (!title || !category_id) {
      return res.status(400).json({ success: false, message: 'Judul dan kategori wajib diisi' });
    }

    // Generate slug
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check slug uniqueness
    const [existingSlugs] = await conn.query('SELECT id FROM recipes WHERE slug = ?', [slug]);
    const uniqueSlug = existingSlugs.length > 0 ? `${slug}-${Date.now()}` : slug;

    // Insert recipe
    const [result] = await conn.query(
      `INSERT INTO recipes (user_id, category_id, title, slug, description, image_url, prep_time, cook_time, servings, difficulty)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, category_id, title, uniqueSlug, description || '', image_url || '', prep_time || 0, cook_time || 0, servings || 1, difficulty || 'mudah']
    );

    const recipeId = result.insertId;

    // Insert ingredients
    if (ingredients && Array.isArray(ingredients)) {
      for (let i = 0; i < ingredients.length; i++) {
        const ing = ingredients[i];
        await conn.query(
          'INSERT INTO ingredients (recipe_id, name, quantity, unit, sort_order) VALUES (?, ?, ?, ?, ?)',
          [recipeId, ing.name, ing.quantity || '', ing.unit || '', i + 1]
        );
      }
    }

    // Insert steps
    if (steps && Array.isArray(steps)) {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        await conn.query(
          'INSERT INTO recipe_steps (recipe_id, step_number, instruction, image_url) VALUES (?, ?, ?, ?)',
          [recipeId, i + 1, step.instruction || step, step.image_url || '']
        );
      }
    }

    await conn.commit();

    res.status(201).json({
      success: true,
      message: 'Resep berhasil ditambahkan',
      data: { id: recipeId, slug: uniqueSlug }
    });
  } catch (err) {
    await conn.rollback();
    console.error('Create recipe error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  } finally {
    conn.release();
  }
});

/**
 * PUT /api/recipes/:id
 * Update resep (admin only)
 */
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { id } = req.params;
    const { title, category_id, description, image_url, prep_time, cook_time, servings, difficulty, ingredients, steps } = req.body;

    // Update recipe
    await conn.query(
      `UPDATE recipes SET title=?, category_id=?, description=?, image_url=?, prep_time=?, cook_time=?, servings=?, difficulty=?
       WHERE id=?`,
      [title, category_id, description || '', image_url || '', prep_time || 0, cook_time || 0, servings || 1, difficulty || 'mudah', id]
    );

    // Replace ingredients
    if (ingredients && Array.isArray(ingredients)) {
      await conn.query('DELETE FROM ingredients WHERE recipe_id = ?', [id]);
      for (let i = 0; i < ingredients.length; i++) {
        const ing = ingredients[i];
        await conn.query(
          'INSERT INTO ingredients (recipe_id, name, quantity, unit, sort_order) VALUES (?, ?, ?, ?, ?)',
          [id, ing.name, ing.quantity || '', ing.unit || '', i + 1]
        );
      }
    }

    // Replace steps
    if (steps && Array.isArray(steps)) {
      await conn.query('DELETE FROM recipe_steps WHERE recipe_id = ?', [id]);
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        await conn.query(
          'INSERT INTO recipe_steps (recipe_id, step_number, instruction, image_url) VALUES (?, ?, ?, ?)',
          [id, i + 1, step.instruction || step, step.image_url || '']
        );
      }
    }

    await conn.commit();
    res.json({ success: true, message: 'Resep berhasil diupdate' });
  } catch (err) {
    await conn.rollback();
    console.error('Update recipe error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  } finally {
    conn.release();
  }
});

/**
 * DELETE /api/recipes/:id
 * Hapus resep (admin only)
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM recipes WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Resep tidak ditemukan' });
    }

    res.json({ success: true, message: 'Resep berhasil dihapus' });
  } catch (err) {
    console.error('Delete recipe error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

module.exports = router;
