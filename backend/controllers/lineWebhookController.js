// backend/controllers/lineWebhookController.js
const lineWebhookService = require('../services/lineWebhookService');
const config = require('../config/appConfig');
const lineClient = require('@line/bot-sdk');
const chatbotService = require('../AIServices/chatbotService');

const lineBotClient = new lineClient.Client({
  channelAccessToken: config.line.channelAccessToken,
});

const lineWebhookController = {
  async handleWebhook(req, res) {
    try {
      await lineWebhookService.processWebhookRequest(
        req,
        res,
        config.line,
        lineBotClient,
        chatbotService
      );
      
      // Only send response if service hasn't already sent one
      if (!res.headersSent) {
        res.status(200).json({ success: true });
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
      
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false, 
          error: 'Webhook processing failed' 
        });
      }
    }
  },
};

module.exports = lineWebhookController;