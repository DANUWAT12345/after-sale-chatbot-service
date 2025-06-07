const pool = require('../db');
const bcrypt = require('bcryptjs');

// Service: Find user by username
async function findUserByUsername(username) {
  const userResult = await pool.query('SELECT * FROM admin_user WHERE username = $1', [username]);
  return userResult.rows[0] || null;
}

// Service: Compare password
async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = {
  findUserByUsername,
  comparePassword,
};
