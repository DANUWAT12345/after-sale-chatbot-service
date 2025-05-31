// backend/model/ChatHistoryModel.js
// This module manages chat history for each user, storing and retrieving from PostgreSQL

const { Pool } = require("pg");
const config = require("../config/appConfig");

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
    CREATE TABLE IF NOT EXISTS chat_history (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      role VARCHAR(32) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
};

// Ensure the table exists before any operations
const tableReady = ensureTable().catch(console.error);

const ChatHistoryModel = {
  async addMessage(userId, role, content) {
    try {
      const query =
        "INSERT INTO chat_history (user_id, role, content) VALUES ($1, $2, $3) RETURNING *";
      const values = [userId, role, content];
      const result = await pool.query(query, values);
      return result;
    } catch (error) {
      throw error;
    }
  },

  async getHistory(userId) {
    const res = await pool.query(
      "SELECT role, content FROM chat_history WHERE user_id = $1 ORDER BY id ASC",
      [userId]
    );
    return res.rows;
  },

  async resetHistory(userId) {
    // Do not delete history from database anymore
    // await pool.query('DELETE FROM chat_history WHERE user_id = $1', [userId]);
  },
};

module.exports = ChatHistoryModel;
