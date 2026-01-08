/**
 * Generic CRUD Helper Functions
 * Reduces code duplication across route handlers
 */

const pool = require('../db/connection');
const { createUniqueSlug } = require('./slug-generator');

/**
 * Generic GET all with pagination, search, and filters
 * @param {Object} config - Configuration object
 * @param {string} config.table - Table name
 * @param {Object} config.query - Query parameters (offset, limit, search, etc.)
 * @param {Array<string>} config.searchFields - Fields to search in
 * @param {Object} config.filters - Additional filters (e.g., { tag: 'value', author: 'value' })
 * @param {string} config.orderBy - Order by clause (default: 'created_at DESC')
 */
async function getAll(config) {
  const {
    table,
    query: reqQuery,
    searchFields = [],
    filters = {},
    orderBy = 'created_at DESC'
  } = config;

  const offset = parseInt(reqQuery.offset) || 0;
  const limit = parseInt(reqQuery.limit) || 6;
  const search = reqQuery.search || '';

  let query = `SELECT * FROM ${table} WHERE 1=1`;
  let countQuery = `SELECT COUNT(*) FROM ${table} WHERE 1=1`;
  const params = [];
  let paramIndex = 1;

  // Add search filter
  if (search && searchFields.length > 0) {
    const searchPattern = `%${search}%`;
    const searchConditions = searchFields
      .map(() => `ILIKE $${paramIndex}`)
      .join(' OR ');
    const searchClause = ` AND (${searchFields.map((field, i) =>
      `${field} ILIKE $${paramIndex}`
    ).join(' OR ')})`;

    query += searchClause;
    countQuery += searchClause;
    params.push(searchPattern);
    paramIndex++;
  }

  // Add dynamic filters
  for (const [filterKey, filterValue] of Object.entries(filters)) {
    const queryValue = reqQuery[filterKey];
    if (queryValue) {
      const pattern = `%${queryValue}%`;
      query += ` AND ${filterValue} ILIKE $${paramIndex}`;
      countQuery += ` AND ${filterValue} ILIKE $${paramIndex}`;
      params.push(pattern);
      paramIndex++;
    }
  }

  // Add numeric range filters (e.g., price)
  const minPrice = parseFloat(reqQuery.minPrice) || null;
  const maxPrice = parseFloat(reqQuery.maxPrice) || null;

  if (minPrice !== null) {
    query += ` AND price >= $${paramIndex}`;
    countQuery += ` AND price >= $${paramIndex}`;
    params.push(minPrice);
    paramIndex++;
  }

  if (maxPrice !== null) {
    query += ` AND price <= $${paramIndex}`;
    countQuery += ` AND price <= $${paramIndex}`;
    params.push(maxPrice);
    paramIndex++;
  }

  // Add status filter (default to published for public views)
  if (reqQuery.status) {
    query += ` AND status = $${paramIndex}`;
    countQuery += ` AND status = $${paramIndex}`;
    params.push(reqQuery.status);
    paramIndex++;
  }

  // Add featured filter
  if (reqQuery.featured === 'true') {
    query += ` AND is_featured = true`;
    countQuery += ` AND is_featured = true`;
  }

  // Add ordering and pagination
  query += ` ORDER BY ${orderBy} OFFSET $${paramIndex} LIMIT $${paramIndex + 1}`;
  params.push(offset, limit);

  const result = await pool.query(query, params);
  const countResult = await pool.query(countQuery, params.slice(0, -2));
  const total = parseInt(countResult.rows[0].count);

  return {
    data: result.rows,
    pagination: {
      offset,
      limit,
      total,
      hasMore: offset + limit < total
    }
  };
}

/**
 * Generic GET by ID
 * @param {string} table - Table name
 * @param {string} id - Record ID
 * @returns {Promise<Object|null>} Record or null if not found
 */
async function getById(table, id) {
  const result = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Generic GET by slug
 * @param {string} table - Table name
 * @param {string} slug - Record slug
 * @returns {Promise<Object|null>} Record or null if not found
 */
async function getBySlug(table, slug) {
  const result = await pool.query(`SELECT * FROM ${table} WHERE slug = $1`, [slug]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Generic CREATE
 * @param {string} table - Table name
 * @param {Object} data - Data to insert
 * @returns {Promise<Object>} Created record
 */
async function create(table, data) {
  // Auto-generate slug if not provided and title exists
  if (!data.slug && data.title) {
    data.slug = await createUniqueSlug(pool, table, data.title);
  }

  // Set published_at if status is published and not already set
  if (data.status === 'published' && !data.published_at) {
    data.published_at = new Date();
  }

  const fields = Object.keys(data);
  const values = Object.values(data);
  const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');

  const query = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
  const result = await pool.query(query, values);

  return result.rows[0];
}

/**
 * Generic UPDATE
 * @param {string} table - Table name
 * @param {string} id - Record ID
 * @param {Object} data - Data to update
 * @returns {Promise<Object|null>} Updated record or null if not found
 */
async function update(table, id, data) {
  // Get current record to check for changes
  const current = await getById(table, id);
  if (!current) return null;

  // Regenerate slug if title changed
  if (data.title && data.title !== current.title && !data.slug) {
    data.slug = await createUniqueSlug(pool, table, data.title, id);
  }

  // Set published_at if status changes to published
  if (data.status === 'published' && current.status !== 'published' && !data.published_at) {
    data.published_at = new Date();
  }

  // Clear published_at if status changes from published
  if (data.status && data.status !== 'published' && current.status === 'published') {
    data.published_at = null;
  }

  const fields = Object.keys(data);
  const values = Object.values(data);
  const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');

  const query = `UPDATE ${table} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING *`;
  const result = await pool.query(query, [...values, id]);

  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Generic DELETE
 * @param {string} table - Table name
 * @param {string} id - Record ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
async function remove(table, id) {
  const result = await pool.query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [id]);
  return result.rows.length > 0;
}

module.exports = {
  getAll,
  getById,
  getBySlug,
  create,
  update,
  remove
};
