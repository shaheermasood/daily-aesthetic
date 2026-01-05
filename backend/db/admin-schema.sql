-- Admin users and authentication schema
-- Run this after the main schema.sql

\c daily_aesthetic;

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admin_sessions table for session management
CREATE TABLE IF NOT EXISTS admin_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES admin_users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX idx_admin_sessions_user_id ON admin_sessions(user_id);
CREATE INDEX idx_admin_sessions_expires ON admin_sessions(expires_at);

-- Insert default admin user (username: admin, password: admin123)
-- Password hash is bcrypt hash of "admin123"
INSERT INTO admin_users (username, password_hash, email, full_name)
VALUES (
    'admin',
    '$2b$10$rBV2kXAe2LQVLhJxE8qVH.N8R5F5nF5vW5m3qJZ3WJ5K4YfZ7Xqme',
    'admin@dailyaesthetic.com',
    'Admin User'
) ON CONFLICT (username) DO NOTHING;
