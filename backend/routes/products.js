const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getAll, getById, create, update, remove } = require('../utils/crud-helpers');

// GET all products with pagination and search
router.get('/', async (req, res) => {
  try {
    const result = await getAll({
      table: 'products',
      query: req.query,
      searchFields: ['title', 'description', 'tags'],
      filters: { tag: 'tags' }
    });

    res.json(result);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await getById('products', req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create new product
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, price, date, image_url, description, tags } = req.body;
    const product = await create('products', {
      title,
      price,
      date,
      image_url,
      description,
      tags
    });

    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update product
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { title, price, date, image_url, description, tags } = req.body;
    const product = await update('products', req.params.id, {
      title,
      price,
      date,
      image_url,
      description,
      tags
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE product
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const deleted = await remove('products', req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
