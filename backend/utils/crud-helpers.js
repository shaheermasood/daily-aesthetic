/**
 * Generic CRUD Helper Functions
 * Reduces code duplication across route handlers
 */

const pool = require('../db/connection');

// Whitelist of allowed tables to prevent SQL injection
const ALLOWED_TABLES = ['projects', 'articles', 'products'];

// Whitelist of allowed order by columns to prevent SQL injection
const ALLOWED_ORDER_BY = {
  'created_at DESC': 'created_at DESC',
  'created_at ASC': 'created_at ASC',
  'updated_at DESC': 'updated_at DESC',
  'updated_at ASC': 'updated_at ASC',
  'title ASC': 'title ASC',
  'title DESC': 'title DESC',
  'price ASC': 'price ASC',
  'price DESC': 'price DESC'
};

// Whitelist of allowed field names to prevent SQL injection
const ALLOWED_FIELDS = {
  projects: ['title', 'date', 'image_url', 'excerpt', 'description', 'tags'],
  articles: ['title', 'author', 'date', 'content', 'image_url'],
  products: ['title', 'price', 'date', 'image_url', 'description', 'tags']
};

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

  // Validate table name against whitelist
  if (!ALLOWED_TABLES.includes(table)) {
    throw new Error('Invalid table name');
  }

  // Validate orderBy against whitelist
  const safeOrderBy = ALLOWED_ORDER_BY[orderBy] || 'created_at DESC';

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

  // Add numeric range filters (e.g., price) - only for products table
  if (table === 'products') {
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
  }

  // Add ordering and pagination (using safe orderBy from whitelist)
  query += ` ORDER BY ${safeOrderBy} OFFSET $${paramIndex} LIMIT $${paramIndex + 1}`;
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
  // Validate table name against whitelist
  if (!ALLOWED_TABLES.includes(table)) {
    throw new Error('Invalid table name');
  }

  const result = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Generic CREATE
 * @param {string} table - Table name
 * @param {Object} data - Data to insert
 * @returns {Promise<Object>} Created record
 */
async function create(table, data) {
  // Validate table name against whitelist
  if (!ALLOWED_TABLES.includes(table)) {
    throw new Error('Invalid table name');
  }

  // Validate field names against whitelist
  const allowedFields = ALLOWED_FIELDS[table] || [];
  const fields = Object.keys(data).filter(field => allowedFields.includes(field));

  if (fields.length === 0) {
    throw new Error('No valid fields to insert');
  }

  const values = fields.map(field => data[field]);
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
  // Validate table name against whitelist
  if (!ALLOWED_TABLES.includes(table)) {
    throw new Error('Invalid table name');
  }

  // Validate field names against whitelist
  const allowedFields = ALLOWED_FIELDS[table] || [];
  const fields = Object.keys(data).filter(field => allowedFields.includes(field));

  if (fields.length === 0) {
    throw new Error('No valid fields to update');
  }

  const values = fields.map(field => data[field]);
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
  // Validate table name against whitelist
  if (!ALLOWED_TABLES.includes(table)) {
    throw new Error('Invalid table name');
  }

  const result = await pool.query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [id]);
  return result.rows.length > 0;
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
