// backend/model/TicketModel.js
// Model for storing ticket metadata and details from AI chatbot

const { Pool } = require('pg');
const config = require('../config/appConfig');

const pool = new Pool({
  user: config.db.user,
  host: config.db.host,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port,
});

// Ensure the table exists
const ensureTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      ticket_number VARCHAR(32) NOT NULL UNIQUE,
      user_id VARCHAR(255),
      request_for TEXT,
      tel VARCHAR(32),
      urgency VARCHAR(32),
      status VARCHAR(32) DEFAULT 'open',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
};
ensureTable().catch(console.error);

const TicketModel = {
  async createTicket({ ticket_number, user_id, request_for, tel, urgency, status = 'open' }) {
    const result = await pool.query(
      `INSERT INTO tickets (ticket_number, user_id, request_for, tel, urgency, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [ticket_number, user_id, request_for, tel, urgency, status]
    );
    return result.rows[0];
  },
  async getTicketByNumber(ticket_number) {
    const result = await pool.query(
      `SELECT * FROM tickets WHERE ticket_number = $1`,
      [ticket_number]
    );
    return result.rows[0];
  },
  async getAllTickets() {
    const result = await pool.query(
      `SELECT id as _id, ticket_number as title, status, created_at as "createdAt" FROM tickets ORDER BY created_at DESC`
    );
    return result.rows;
  },
  // Add more CRUD as needed
};

module.exports = TicketModel;
