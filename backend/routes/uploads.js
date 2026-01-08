/**
 * Image upload routes
 */

const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');
const path = require('path');
const fs = require('fs').promises;

/**
 * POST /api/uploads/image
 * Upload an image file
 */
router.post('/image', requireAuth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Return the file info and URL
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

/**
 * POST /api/uploads/images
 * Upload multiple image files
 */
router.post('/images', requireAuth, upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Return array of file info and URLs
    const files = req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/${file.filename}`
    }));

    res.json({
      success: true,
      files
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

/**
 * DELETE /api/uploads/:filename
 * Delete an uploaded file
 */
router.delete('/:filename', requireAuth, async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'uploads', filename);

    // Check if file exists
    await fs.access(filePath);

    // Delete the file
    await fs.unlink(filePath);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'File not found' });
    }
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

/**
 * GET /api/uploads
 * List all uploaded files
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const files = await fs.readdir(uploadsDir);

    const fileStats = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(uploadsDir, filename);
        const stats = await fs.stat(filePath);
        return {
          filename,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          url: `/uploads/${filename}`
        };
      })
    );

    // Sort by creation date (newest first)
    fileStats.sort((a, b) => b.created - a.created);

    res.json({
      success: true,
      files: fileStats
    });
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

module.exports = router;
