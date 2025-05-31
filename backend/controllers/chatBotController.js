// backend/controller/chatBotController.js
const chatbotService = require('../AIServices/chatbotService'); // Use the generic chatbot service

exports.getReply = async (req, res) => {
  const { userId, message } = req.body;
  try {
    const reply = await chatbotService.getReply(userId, message);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};