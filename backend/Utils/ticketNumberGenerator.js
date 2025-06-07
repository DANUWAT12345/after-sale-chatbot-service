// backend/Utils/ticketNumberGenerator.js
// Utility to generate ticket numbers in the format TK-YYYYMMDD-XXX

// Singleton ticket number generator (in-memory, resets daily, and checks DB for max number)
let lastDate = null;
let dailyCounter = 0;
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
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  if (lastDate !== dateStr) {
    // On a new day, check DB for max ticket number for today
    lastDate = dateStr;
    const res = await pool.query(
      `SELECT ticket_number FROM tickets WHERE ticket_number LIKE $1`, [`REQ-${dateStr}-%`]
    );
    let maxNum = 0;
    for (const row of res.rows) {
      const match = row.ticket_number.match(/REQ-\d{8}-(\d{3})/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
    dailyCounter = maxNum + 1;
  } else {
    dailyCounter += 1;
  }
  const ticketNumber = `REQ-${dateStr}-${String(dailyCounter).padStart(3, '0')}`;
  console.log(`[TicketNumberGenerator] Generated ticket: ${ticketNumber} at ${now.toLocaleString()}`);
  return ticketNumber;
}

module.exports = { generateTicketNumber };
