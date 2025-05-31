const { OpenAI } = require("openai");
const systemPrompt = require('../Utils/systemPrompt');

console.log("DEBUG OPENAI_API_KEY:", process.env.OPENAI_API_KEY);

class NainAgentWithMemory {
  constructor(openaiApiKey) {
    this.openai = new OpenAI({ apiKey: openaiApiKey });
    this.systemPrompt = systemPrompt;
    // Store conversation history per userId
    this.userHistories = new Map();
  }

  // Add a message to user's history
  _addToHistory(userId, role, content) {
    if (!this.userHistories.has(userId)) {
      this.userHistories.set(userId, []);
    }
    this.userHistories.get(userId).push({ role, content });
  }

  // Get user's conversation history
  _getHistory(userId) {
    return this.userHistories.get(userId) || [];
  }

  // Reset user's conversation history (e.g., after ticket is closed)
  resetHistory(userId) {
    this.userHistories.set(userId, []);
  }

  // Main chat method
  async chat(userId, userInput) {
    this._addToHistory(userId, "user", userInput);

    const conversationHistory = this._getHistory(userId);

    const messages = [
      { role: "system", content: this.systemPrompt },
      ...conversationHistory
    ];

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 300,
      temperature: 0.7,
    });

    const reply = response.choices[0].message.content.trim();
    this._addToHistory(userId, "assistant", reply);

    return reply;
  }
}

// At the end of the file, replace this:
module.exports = NainAgentWithMemory;

// With this:
const nainAgentSingleton = new NainAgentWithMemory(process.env.OPENAI_API_KEY);
module.exports = nainAgentSingleton;