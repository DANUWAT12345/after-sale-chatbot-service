const config = require('../config/appConfig');
const systemPrompt = require('../Utils/systemPrompt');

class GeminiChatbotService {
  constructor() {
    this.apiKey = config.openai.apiKey;
    this.userHistories = new Map();
  }

  _addToHistory(userId, role, content) {
    if (!this.userHistories.has(userId)) {
      this.userHistories.set(userId, []);
    }
    this.userHistories.get(userId).push({ role, content });
  }

  _getHistory(userId) {
    return this.userHistories.get(userId) || [];
  }

  resetHistory(userId) {
    this.userHistories.set(userId, []);
  }

  async chat(userId, userInput) {
    this._addToHistory(userId, "user", userInput);
    const conversationHistory = this._getHistory(userId);

    // Compose messages: system prompt + conversation history
    const contents = [
      { role: "user", parts: [{ text: systemPrompt }] },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }))
    ];

    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: this.apiKey });

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents,
      });
      const chatbotReply = response.text;
      this._addToHistory(userId, "assistant", chatbotReply);
      return chatbotReply;
    } catch (error) {
      console.error("❌ Error communicating with Gemini Chatbot:", error.message);
      throw new Error("Failed to get a reply from Gemini Chatbot");
    }
  }
}

const geminiChatbotSingleton = new GeminiChatbotService();
module.exports = geminiChatbotSingleton;
