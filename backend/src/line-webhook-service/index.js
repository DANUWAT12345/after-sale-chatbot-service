// backend/src/line-webhook-service/index.js

const express = require('express');
// Create an Express Router instance specific to this microservice.
// This allows us to define routes that can be easily plugged into the main app.
const router = express.Router();

// Import the LineWebhookController.
// This is where the actual logic for handling the webhook will reside, following OOP.
const LineWebhookController = require('./controllers/lineWebhookController');

// Define a POST route for the Line webhook.
// When a POST request comes to '/line/webhook' (due to app.use('/line', ...) in app.js),
// this 'router.post('/webhook', ...)' will handle it.
// The request will be passed to the static 'handleWebhook' method of our controller class.
router.post('/webhook', LineWebhookController.handleWebhook);

// Export this router so app.js can import and use it.
module.exports = router;