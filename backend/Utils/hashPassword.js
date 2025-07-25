const bcrypt = require('bcryptjs');

// Utility to hash a password
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

module.exports = { hashPassword };
