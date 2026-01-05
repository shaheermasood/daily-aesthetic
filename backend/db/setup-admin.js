const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'daily_aesthetic',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function setupAdmin() {
  try {
    console.log('Setting up admin tables...');

    // Create admin_users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✓ admin_users table created');

    // Create admin_sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES admin_users(id) ON DELETE CASCADE,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✓ admin_sessions table created');

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at)
    `);

    console.log('✓ Indexes created');

    // Check if admin user exists
    const existingAdmin = await pool.query(
      'SELECT * FROM admin_users WHERE username = $1',
      ['admin']
    );

    if (existingAdmin.rows.length === 0) {
      // Hash password
      const passwordHash = await bcrypt.hash('admin123', 10);

      // Insert default admin user
      await pool.query(`
        INSERT INTO admin_users (username, password_hash, email, full_name)
        VALUES ($1, $2, $3, $4)
      `, ['admin', passwordHash, 'admin@dailyaesthetic.com', 'Admin User']);

      console.log('✓ Default admin user created');
      console.log('  Username: admin');
      console.log('  Password: admin123');
      console.log('  Email: admin@dailyaesthetic.com');
    } else {
      console.log('✓ Admin user already exists');
    }

    console.log('\n✅ Admin setup completed successfully!');
  } catch (error) {
    console.error('❌ Error setting up admin:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupAdmin();
