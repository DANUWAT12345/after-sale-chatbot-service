// backend/config/appConfig.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Adjust path as needed

const config = {
  port: process.env.PORT || 3001,
  line: {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  db: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10),
  },
};


function validateConfig(appConfig) {
  console.log("=== ENVIRONMENT CHECK ===");
  console.log("LINE_CHANNEL_ACCESS_TOKEN exists:", !!appConfig.line.channelAccessToken);
  console.log("LINE_CHANNEL_SECRET exists:", !!appConfig.line.channelSecret);
  console.log("OPENAI_API_KEY exists:", !!appConfig.openai.apiKey);

  if (!appConfig.line.channelAccessToken || !appConfig.line.channelSecret) {
    console.error("❌ MISSING LINE CONFIGURATION!");
    throw new Error("LINE configuration is incomplete");
  }
  if (!appConfig.openai.apiKey) {
    console.error("❌ MISSING OPENAI API KEY!");
    throw new Error("OpenAI API key is missing");
  }
  console.log("✅ LINE and OpenAI configuration is complete");
}

validateConfig(config);

module.exports = config;