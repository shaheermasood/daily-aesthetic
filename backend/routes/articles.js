const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getAll, getById, create, update, remove } = require('../utils/crud-helpers');

// GET all articles with pagination and search
router.get('/', async (req, res) => {
  try {
    const result = await getAll({
      table: 'articles',
      query: { ...req.query, limit: req.query.limit || 1 },
      searchFields: ['title', 'content', 'author'],
      filters: { author: 'author' }
    });

    res.json(result);
  } catch (err) {
    console.error('Error fetching articles:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single article by ID
router.get('/:id', async (req, res) => {
  try {
    const article = await getById('articles', req.params.id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article);
  } catch (err) {
    console.error('Error fetching article:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create new article
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, author, date, content, image_url } = req.body;
    const article = await create('articles', {
      title,
      author,
      date,
      content,
      image_url
    });

    res.status(201).json(article);
  } catch (err) {
    console.error('Error creating article:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update article
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { title, author, date, content, image_url } = req.body;
    const article = await update('articles', req.params.id, {
      title,
      author,
      date,
      content,
      image_url
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article);
  } catch (err) {
    console.error('Error updating article:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE article
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const deleted = await remove('articles', req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json({ message: 'Article deleted successfully' });
  } catch (err) {
    console.error('Error deleting article:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
