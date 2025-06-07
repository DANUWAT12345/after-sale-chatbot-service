// backend/db.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Check if the connection is successful
pool.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Connection error', err.stack));

module.exports = pool;