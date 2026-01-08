/**
 * Slug generation utilities for CMS content
 */

/**
 * Generate a URL-friendly slug from a title
 * @param {string} title - The title to convert to a slug
 * @returns {string} - The generated slug
 */
function generateSlug(title) {
  if (!title) return '';

  return title
    .toLowerCase()
    .trim()
    // Remove special characters
    .replace(/[^a-z0-9\s-]/g, '')
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Replace multiple hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-|-$/g, '');
}

/**
 * Ensure slug is unique by checking database and appending number if needed
 * @param {object} pool - PostgreSQL connection pool
 * @param {string} table - Table name (projects, articles, products)
 * @param {string} baseSlug - The base slug to check
 * @param {number|null} excludeId - ID to exclude from check (for updates)
 * @returns {Promise<string>} - Unique slug
 */
async function ensureUniqueSlug(pool, table, baseSlug, excludeId = null) {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    // Check if slug exists
    const query = excludeId
      ? `SELECT id FROM ${table} WHERE slug = $1 AND id != $2`
      : `SELECT id FROM ${table} WHERE slug = $1`;

    const params = excludeId ? [slug, excludeId] : [slug];
    const result = await pool.query(query, params);

    // If slug doesn't exist, it's unique
    if (result.rows.length === 0) {
      return slug;
    }

    // Try next variation
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

/**
 * Generate slug from title and ensure it's unique
 * @param {object} pool - PostgreSQL connection pool
 * @param {string} table - Table name
 * @param {string} title - Content title
 * @param {number|null} excludeId - ID to exclude from uniqueness check
 * @returns {Promise<string>} - Unique slug
 */
async function createUniqueSlug(pool, table, title, excludeId = null) {
  const baseSlug = generateSlug(title);
  return await ensureUniqueSlug(pool, table, baseSlug, excludeId);
}

module.exports = {
  generateSlug,
  ensureUniqueSlug,
  createUniqueSlug
};
