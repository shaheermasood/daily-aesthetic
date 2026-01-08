const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { requireAuth } = require('../middleware/auth');

// GET all products with pagination and search
router.get('/', async (req, res) => {
  try {
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 6;
    const search = req.query.search || '';
    const tag = req.query.tag || '';
    const minPrice = parseFloat(req.query.minPrice) || null;
    const maxPrice = parseFloat(req.query.maxPrice) || null;

    let query = 'SELECT * FROM products WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) FROM products WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Add search filter
    if (search) {
      const searchPattern = `%${search}%`;
      query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR tags ILIKE $${paramIndex})`;
      countQuery += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR tags ILIKE $${paramIndex})`;
      params.push(searchPattern);
      paramIndex++;
    }

    // Add tag filter
    if (tag) {
      const tagPattern = `%${tag}%`;
      query += ` AND tags ILIKE $${paramIndex}`;
      countQuery += ` AND tags ILIKE $${paramIndex}`;
      params.push(tagPattern);
      paramIndex++;
    }

    // Add price filters
    if (minPrice !== null) {
      query += ` AND price >= $${paramIndex}`;
      countQuery += ` AND price >= $${paramIndex}`;
      params.push(minPrice);
      paramIndex++;
    }

    if (maxPrice !== null) {
      query += ` AND price <= $${paramIndex}`;
      countQuery += ` AND price <= $${paramIndex}`;
      params.push(maxPrice);
      paramIndex++;
    }

    // Add ordering and pagination
    query += ` ORDER BY created_at DESC OFFSET $${paramIndex} LIMIT $${paramIndex + 1}`;
    params.push(offset, limit);

    const result = await pool.query(query, params);
    const countResult = await pool.query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: result.rows,
      pagination: {
        offset,
        limit,
        total,
        hasMore: offset + limit < total
      }
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create new product
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, price, date, image_url, description, tags } = req.body;

    const result = await pool.query(
      'INSERT INTO products (title, price, date, image_url, description, tags) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, price, date, image_url, description, tags]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update product
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, date, image_url, description, tags } = req.body;

    const result = await pool.query(
      'UPDATE products SET title = $1, price = $2, date = $3, image_url = $4, description = $5, tags = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
      [title, price, date, image_url, description, tags, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE product
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
