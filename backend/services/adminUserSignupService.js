const pool = require('../db');

// Service: Insert new admin user into the database
async function insertAdminUser({ name, role, tel, username, hashedPassword }) {
  await pool.query(
    'INSERT INTO admin_user (name, role, tel, username, password) VALUES ($1, $2, $3, $4, $5)',
    [name, role, tel, username, hashedPassword]
  );
}

module.exports = {
  insertAdminUser,
};
