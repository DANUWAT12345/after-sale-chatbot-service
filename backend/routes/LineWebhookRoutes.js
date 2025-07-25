// LINE Webhook Routes
const express = require('express');
const lineWebhookController = require('../controllers/lineWebhookController');

const router = express.Router();

// Apply raw body parser for signature validation on webhook endpoint
router.use('/webhook', express.raw({ type: 'application/json' }));

// Handle incoming webhook POST requests
router.post('/webhook', lineWebhookController.handleWebhook);

module.exports = router;