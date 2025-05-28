const nainAgent = require('../services/OpenAIChatbotService');

exports.getReply = async (req, res) => {
  const { userId, message } = req.body;
  try {
    const reply = await nainAgent.chat(userId, message);
    // Reset memory if ticket issued
    if (/REQ-\d{8}-\d+/i.test(reply)) {
      nainAgent.resetHistory(userId);
    }
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};