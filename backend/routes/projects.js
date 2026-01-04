const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// GET all projects with pagination
router.get('/', async (req, res) => {
  try {
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 6;
    const search = req.query.search || '';
    const tag = req.query.tag || '';

    let queryParams = [];
    let paramIndex = 1;
    let whereConditions = [];

    // Add search condition
    if (search) {
      whereConditions.push(`(title ILIKE $${paramIndex} OR excerpt ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Add tag filter condition
    if (tag) {
      whereConditions.push(`$${paramIndex} = ANY(tags)`);
      queryParams.push(tag);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Add offset and limit
    queryParams.push(offset, limit);

    const result = await pool.query(
      `SELECT * FROM projects ${whereClause} ORDER BY created_at DESC OFFSET $${paramIndex} LIMIT $${paramIndex + 1}`,
      queryParams
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM projects ${whereClause}`,
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
router.post('/', async (req, res) => {
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
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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
