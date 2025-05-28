const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const db = require('../db.js');

console.log('=== SERVER STARTUP DEBUG ===');
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('Environment file path:', path.resolve(__dirname, '../.env'));
console.log('LINE_CHANNEL_ACCESS_TOKEN loaded:', !!process.env.LINE_CHANNEL_ACCESS_TOKEN);
console.log('LINE_CHANNEL_SECRET loaded:', !!process.env.LINE_CHANNEL_SECRET);
console.log('OPENAI_API_KEY loaded:', !!process.env.OPENAI_API_KEY);
console.log('=== END SERVER DEBUG ===');

// Import LINE webhook routes AFTER environment is loaded
const lineWebhookRoutes = require('../routes/lineWebhookRoutes');

class ServerFacade {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3001;
  }

  configureEnvironment() {
    // console.log("DB config values:");
    // console.log("DB_USER:", process.env.DB_USER);
    // console.log("DB_PASSWORD:", process.env.DB_PASSWORD, "| Type:", typeof process.env.DB_PASSWORD);
    // console.log("DB_NAME:", process.env.DB_NAME);
    // console.log("DB_HOST:", process.env.DB_HOST);
    // console.log("DB_PORT:", process.env.DB_PORT, "| Type:", typeof process.env.DB_PORT);
  }

  configureMiddlewares() {
    this.app.use(cors()); // Enable CORS for all routes
    // Note: We'll handle JSON parsing per route as needed
    // LINE webhook needs raw body for signature validation
    this.app.use((req, res, next) => {
      if (req.path.includes('/api/line/webhook')) {
        // Skip JSON parsing for LINE webhook
        next();
      } else {
        // Apply JSON parsing for other routes
        express.json()(req, res, next);
      }
    });
    this.app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies
  }

  configureRoutes() {
    // Basic health check route
    this.app.get('/api/health', (req, res) => {
      res.status(200).json({ status: 'UP', message: 'Backend is running!' });
    });
  }

  configureLineWebhookRoutes() {
    console.log('=== CONFIGURING LINE WEBHOOK ROUTES ===');
    this.app.use('/api/line', lineWebhookRoutes);
    console.log('=== LINE WEBHOOK ROUTES CONFIGURED ===');
  }

  connectToDatabase() {
    db.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.error('Error connecting to database', err.stack);
      } else {
        console.log('Connected to database:', res.rows[0]);
      }
    });
  }

  startServer() {
    this.app.listen(this.port, () => {
      console.log(`Backend server is running on http://localhost:${this.port}`);
    });
  }

  start() {
    this.configureEnvironment();
    this.configureMiddlewares();
    this.configureRoutes();
    this.connectToDatabase();
    this.configureLineWebhookRoutes();
    this.startServer();
  }
}

// Instantiate and start the server using the facades
const server = new ServerFacade();
server.start();