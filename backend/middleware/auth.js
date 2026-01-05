const pool = require('../db/connection');

// Middleware to check if user is authenticated
async function requireAuth(req, res, next) {
  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');

    if (!sessionToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if session exists and is valid
    const result = await pool.query(
      `SELECT s.*, u.username, u.email, u.full_name, u.is_active
       FROM admin_sessions s
       JOIN admin_users u ON s.user_id = u.id
       WHERE s.session_token = $1 AND s.expires_at > NOW() AND u.is_active = true`,
      [sessionToken]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Attach user info to request
    req.user = result.rows[0];
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Optional auth - doesn't fail if not authenticated
async function optionalAuth(req, res, next) {
  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');

    if (sessionToken) {
      const result = await pool.query(
        `SELECT s.*, u.username, u.email, u.full_name
         FROM admin_sessions s
         JOIN admin_users u ON s.user_id = u.id
         WHERE s.session_token = $1 AND s.expires_at > NOW()`,
        [sessionToken]
      );

      if (result.rows.length > 0) {
        req.user = result.rows[0];
      }
    }
    next();
  } catch (err) {
    console.error('Optional auth middleware error:', err);
    next();
  }
}

module.exports = {
  requireAuth,
  optionalAuth
};
