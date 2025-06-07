// backend/routes/ticketRoutes.js
const express = require('express');
const ticketController = require('../controllers/ticketController');

const router = express.Router();

// GET /tickets
router.get('/', ticketController.getTickets);

module.exports = router;
