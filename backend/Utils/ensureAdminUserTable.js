const pool = require('../db');

// Utility to ensure the admin_user table exists
async function ensureAdminUserTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS admin_user (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    tel VARCHAR(20) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
}

module.exports = { ensureAdminUserTable };
