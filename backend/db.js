// backend/db.js
const { Pool } = require('pg');
const appConfig = require('./config/appConfig'); // Import centralized config

const pool = new Pool({
  user: appConfig.db.user,
  host: appConfig.db.host,
  database: appConfig.db.database,
  password: appConfig.db.password,
  port: appConfig.db.port,
});

// Check if the connection is successful
pool.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Connection error', err.stack));

module.exports = {
  query: (text, params) => pool.query(text, params),
};