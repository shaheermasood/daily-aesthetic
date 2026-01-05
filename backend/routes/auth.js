const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const pool = require('../db/connection');
const { requireAuth } = require('../middleware/auth');

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Get user from database
    const userResult = await pool.query(
      'SELECT * FROM admin_users WHERE username = $1 AND is_active = true',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session token
    const sessionToken = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store session in database
    await pool.query(
      'INSERT INTO admin_sessions (user_id, session_token, expires_at) VALUES ($1, $2, $3)',
      [user.id, sessionToken, expiresAt]
    );

    // Return user info and token (exclude password hash)
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name
      },
      token: sessionToken,
      expiresAt: expiresAt.toISOString()
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout endpoint
router.post('/logout', requireAuth, async (req, res) => {
  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');

    // Delete session from database
    await pool.query(
      'DELETE FROM admin_sessions WHERE session_token = $1',
      [sessionToken]
    );

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user endpoint
router.get('/me', requireAuth, (req, res) => {
  res.json({
    user: {
      id: req.user.user_id,
      username: req.user.username,
      email: req.user.email,
      full_name: req.user.full_name
    }
  });
});

// Change password endpoint
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Get current user
    const userResult = await pool.query(
      'SELECT * FROM admin_users WHERE id = $1',
      [req.user.user_id]
    );

    const user = userResult.rows[0];

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE admin_users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [passwordHash, req.user.user_id]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cleanup expired sessions (should be run periodically)
router.post('/cleanup-sessions', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM admin_sessions WHERE expires_at < NOW()'
    );

    res.json({
      message: 'Expired sessions cleaned up',
      deleted: result.rowCount
    });
  } catch (err) {
    console.error('Cleanup sessions error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
