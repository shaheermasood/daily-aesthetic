const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { requireAuth } = require('../middleware/auth');

// GET all articles with pagination and search
router.get('/', async (req, res) => {
  try {
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 1;
    const search = req.query.search || '';
    const author = req.query.author || '';

    let query = 'SELECT * FROM articles WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) FROM articles WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Add search filter
    if (search) {
      const searchPattern = `%${search}%`;
      query += ` AND (title ILIKE $${paramIndex} OR content ILIKE $${paramIndex} OR author ILIKE $${paramIndex})`;
      countQuery += ` AND (title ILIKE $${paramIndex} OR content ILIKE $${paramIndex} OR author ILIKE $${paramIndex})`;
      params.push(searchPattern);
      paramIndex++;
    }

    // Add author filter
    if (author) {
      const authorPattern = `%${author}%`;
      query += ` AND author ILIKE $${paramIndex}`;
      countQuery += ` AND author ILIKE $${paramIndex}`;
      params.push(authorPattern);
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
    console.error('Error fetching articles:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single article by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM articles WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching article:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create new article
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, author, date, content, image_url } = req.body;

    const result = await pool.query(
      'INSERT INTO articles (title, author, date, content, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, author, date, content, image_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating article:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update article
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, date, content, image_url } = req.body;

    const result = await pool.query(
      'UPDATE articles SET title = $1, author = $2, date = $3, content = $4, image_url = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [title, author, date, content, image_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating article:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE article
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM articles WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json({ message: 'Article deleted successfully' });
  } catch (err) {
    console.error('Error deleting article:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
