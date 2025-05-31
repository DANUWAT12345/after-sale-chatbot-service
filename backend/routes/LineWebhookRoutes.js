// backend/routes/lineWebhookRoutes.js (consistent naming)
const express = require("express");
const lineWebhookController = require('../controllers/lineWebhookController');

const router = express.Router();

// Use raw body for signature validation
router.use("/webhook", express.raw({ type: "application/json" }));
router.post("/webhook", lineWebhookController.handleWebhook);

module.exports = router;