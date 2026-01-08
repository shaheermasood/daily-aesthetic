/**
 * Input validation middleware
 * Validates request body fields before processing
 */

/**
 * Validate project data
 */
function validateProject(req, res, next) {
  const { title } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
  }

  if (title.length > 255) {
    return res.status(400).json({ error: 'Title must be less than 255 characters' });
  }

  next();
}

/**
 * Validate article data
 */
function validateArticle(req, res, next) {
  const { title } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
  }

  if (title.length > 255) {
    return res.status(400).json({ error: 'Title must be less than 255 characters' });
  }

  next();
}

/**
 * Validate product data
 */
function validateProduct(req, res, next) {
  const { title, price } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
  }

  if (title.length > 255) {
    return res.status(400).json({ error: 'Title must be less than 255 characters' });
  }

  // Price is optional, but if provided must be a valid number
  if (price !== undefined && price !== null && price !== '') {
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }
  }

  next();
}

/**
 * Sanitize string input to prevent injection attacks
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  // Remove null bytes and control characters except newlines and tabs
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

module.exports = {
  validateProject,
  validateArticle,
  validateProduct,
  sanitizeString
};
