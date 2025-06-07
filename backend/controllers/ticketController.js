// backend/controllers/ticketController.js
const TicketModel = require('../model/TicketModel');

// GET /tickets
exports.getTickets = async (req, res) => {
  try {
    const { role } = req.query;
    let tickets;
    if (role === 'admin') {
      tickets = await TicketModel.getAllTickets();
    } else if (role === 'client') {
      // You may want to filter by user, here is a simple example:
      // const userId = req.user.id; // If you have authentication
      // tickets = await TicketModel.getTicketsByUser(userId);
      tickets = await TicketModel.getAllTickets(); // Or filter as needed
    } else {
      tickets = await TicketModel.getAllTickets();
    }
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};
