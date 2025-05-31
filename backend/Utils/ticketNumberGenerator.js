// backend/Utils/ticketNumberGenerator.js
// Utility to generate ticket numbers in the format TK-YYYYMMDD-XXX

const { Pool } = require('pg');
const config = require('../config/appConfig');

const pool = new Pool({
  user: config.db.user,
  host: config.db.host,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port,
});

async function generateTicketNumber() {
  // Get current date in YYYYMMDD
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // Count tickets issued today
  const res = await pool.query(
    `SELECT COUNT(*) FROM chat_history WHERE created_at::date = CURRENT_DATE AND content ~ 'TK-${dateStr}-\\d{3}'`
  );
  const countToday = parseInt(res.rows[0].count, 10) + 1;
  const ticketNumber = `TK-${dateStr}-${String(countToday).padStart(3, '0')}`;

  // Print to console with real world time
  console.log(`[TicketNumberGenerator] Generated ticket: ${ticketNumber} at ${now.toLocaleString()}`);
  return ticketNumber;
}

module.exports = { generateTicketNumber };
