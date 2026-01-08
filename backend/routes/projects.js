const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const { requireAuth } = require('../middleware/auth');

// GET all projects with pagination and search
router.get('/', async (req, res) => {
  try {
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 6;
    const search = req.query.search || '';
    const tag = req.query.tag || '';

    let query = 'SELECT * FROM projects WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) FROM projects WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Add search filter
    if (search) {
      const searchPattern = `%${search}%`;
      query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR excerpt ILIKE $${paramIndex} OR tags ILIKE $${paramIndex})`;
      countQuery += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR excerpt ILIKE $${paramIndex} OR tags ILIKE $${paramIndex})`;
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
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single project by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create new project
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, date, image_url, excerpt, description, tags } = req.body;

    const result = await pool.query(
      'INSERT INTO projects (title, date, image_url, excerpt, description, tags) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, date, image_url, excerpt, description, tags]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update project
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, image_url, excerpt, description, tags } = req.body;

    const result = await pool.query(
      'UPDATE projects SET title = $1, date = $2, image_url = $3, excerpt = $4, description = $5, tags = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
      [title, date, image_url, excerpt, description, tags, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE project
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
