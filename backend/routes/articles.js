const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// GET all articles with pagination
router.get('/', async (req, res) => {
  try {
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 1;
    const search = req.query.search || '';

    let queryParams = [];
    let paramIndex = 1;
    let whereConditions = [];

    // Add search condition
    if (search) {
      whereConditions.push(`(title ILIKE $${paramIndex} OR author ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Add offset and limit
    queryParams.push(offset, limit);

    const result = await pool.query(
      `SELECT * FROM articles ${whereClause} ORDER BY created_at DESC OFFSET $${paramIndex} LIMIT $${paramIndex + 1}`,
      queryParams
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM articles ${whereClause}`,
      queryParams.slice(0, -2)
    );
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
router.post('/', async (req, res) => {
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
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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
