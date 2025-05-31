// backend/src/server.js
const express = require('express');
const cors = require('cors');
const db = require('../db.js'); // Assuming db.js connects using appConfig now
const appConfig = require('../config/appConfig'); // Import centralized config

// Import LINE webhook routes AFTER environment is loaded
const lineWebhookRoutes = require('../routes/LineWebhookRoutes');
const chatBotRouter = require('../routes/chatBotRouter'); 

class ServerFacade {
  constructor() {
    this.app = express();
    this.port = appConfig.port; // Use port from appConfig
  }

  configureMiddlewares() {
    this.app.use(cors());
    // Conditional JSON parsing to handle LINE webhook's raw body requirement
    this.app.use((req, res, next) => {
      if (req.path.includes('/api/line/webhook')) {
        next(); // Skip JSON parsing for LINE webhook
      } else {
        express.json()(req, res, next); // Apply JSON parsing for other routes
      }
    });
    this.app.use(express.urlencoded({ extended: true }));
  }

  configureRoutes() {
    // Basic health check route
    this.app.get('/api/health', (req, res) => {
      res.status(200).json({ status: 'UP', message: 'Backend is running!' });
    });

    this.app.use('/api/line', lineWebhookRoutes);
    this.app.use('/api/chatbot', chatBotRouter);
  }

  connectToDatabase() {
    db.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.error('Error connecting to database', err.stack);
      } else {
        console.log('Connected to PostgreSQL database:', res.rows[0]);
      }
    });
  }

  startServer() {
    this.app.listen(this.port, () => {
      console.log(`Backend server is running on http://localhost:${this.port}`);
    });
  }

  start() {
    this.configureMiddlewares();
    this.configureRoutes();
    this.connectToDatabase();
    this.startServer();
  }
}

// Instantiate and start the server
const server = new ServerFacade();
server.start();