const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { validateProject } = require('../middleware/validation');
const { getAll, getById, create, update, remove } = require('../utils/crud-helpers');

// GET all projects with pagination and search
router.get('/', async (req, res) => {
  try {
    const result = await getAll({
      table: 'projects',
      query: req.query,
      searchFields: ['title', 'description', 'excerpt', 'tags'],
      filters: { tag: 'tags' }
    });

    res.json(result);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await getById('projects', req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create new project
router.post('/', requireAuth, validateProject, async (req, res) => {
  try {
    const { title, date, image_url, excerpt, description, tags } = req.body;
    const project = await create('projects', {
      title,
      date,
      image_url,
      excerpt,
      description,
      tags
    });

    res.status(201).json(project);
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update project
router.put('/:id', requireAuth, validateProject, async (req, res) => {
  try {
    const { title, date, image_url, excerpt, description, tags } = req.body;
    const project = await update('projects', req.params.id, {
      title,
      date,
      image_url,
      excerpt,
      description,
      tags
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE project
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const deleted = await remove('projects', req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
