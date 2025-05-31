// backend/services/chatbotService.js
const openaiChatbot = require('./OpenAIChatbotService');
const geminiChatbot = require('./GeminiChatbotService');
const ChatHistoryModel = require('../model/ChatHistoryModel');

function createChatbotService(model = 'openai') {
  let activeChatbot;
  if (model === 'gemini') {
    activeChatbot = geminiChatbot;
  } else {
    activeChatbot = openaiChatbot;
  }

  return {
    async getReply(userId, userMessage) {
      // Store user message in DB
      await ChatHistoryModel.addMessage(userId, 'user', userMessage);
      let reply;
      try {
        // Get full history from DB
        const history = await ChatHistoryModel.getHistory(userId);
        reply = await activeChatbot.chat(userId, userMessage, history); // Pass history if supported
      } catch (primaryErr) {
        if (activeChatbot === openaiChatbot) {
          console.error('OpenAI failed, falling back to Gemini:', primaryErr.message);
          try {
            const history = await ChatHistoryModel.getHistory(userId);
            reply = await geminiChatbot.chat(userId, userMessage, history);
          } catch (geminiErr) {
            console.error('Gemini also failed:', geminiErr.message);
            return 'ขออภัยค่ะ ขณะนี้ระบบขัดข้อง กรุณาลองใหม่อีกครั้งภายหลัง';
          }
        } else {
          console.error('Gemini failed:', primaryErr.message);
          return 'ขออภัยค่ะ ขณะนี้ระบบขัดข้อง กรุณาลองใหม่อีกครั้งภายหลัง';
        }
      }
      // Store assistant reply in DB
      await ChatHistoryModel.addMessage(userId, 'assistant', reply);
      // Apply common post-processing logic, like memory reset
      if (/REQ-\d{8}-\d+/i.test(reply)) {
        // Print full history for this ticket
        const history = await ChatHistoryModel.getHistory(userId);
        console.log('=== Ticket Issued: Conversation History ===');
        history.forEach((msg, idx) => {
          console.log(`${idx + 1}. [${msg.role}] ${msg.content}`);
        });
        console.log(`Ticket Number: ${reply.match(/REQ-\d{8}-\d+/i)?.[0] || 'N/A'}`);
        await ChatHistoryModel.resetHistory(userId);
        if (typeof openaiChatbot.resetHistory === 'function') {
          openaiChatbot.resetHistory(userId);
        }
        if (typeof geminiChatbot.resetHistory === 'function') {
          geminiChatbot.resetHistory(userId);
        }
        console.log(`Conversation history reset for user: ${userId}`);
      }
      return reply;
    },
    switchModel(newModel) {
      if (newModel === 'gemini') {
        activeChatbot = geminiChatbot;
      } else if (newModel === 'openai') {
        activeChatbot = openaiChatbot;
      } else {
        console.warn(`Unknown chatbot model: ${newModel}. Sticking to current.`);
      }
    }
  };
}

// Export a singleton instance for most use cases
const chatbotService = createChatbotService();
module.exports = chatbotService;
// Also export the factory for advanced use
module.exports.createChatbotService = createChatbotService;