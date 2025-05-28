const express = require("express");
const line = require("@line/bot-sdk");
const crypto = require("crypto");

class LineConfig {
  constructor() {
    this.channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    this.channelSecret = process.env.LINE_CHANNEL_SECRET;
    this.openaiApiKey = process.env.OPENAI_API_KEY;

    this.validateConfig();
  }

  validateConfig() {
    console.log("=== ENVIRONMENT CHECK ===");
    console.log("LINE_CHANNEL_ACCESS_TOKEN exists:", !!this.channelAccessToken);
    console.log("LINE_CHANNEL_SECRET exists:", !!this.channelSecret);
    console.log("OPENAI_API_KEY exists:", !!this.openaiApiKey);

    if (!this.channelAccessToken || !this.channelSecret) {
      console.error("❌ MISSING LINE CONFIGURATION!");
      throw new Error("LINE configuration is incomplete");
    }
    if (!this.openaiApiKey) {
      console.error("❌ MISSING OPENAI API KEY!");
      throw new Error("OpenAI API key is missing");
    }

    console.log("✅ LINE and OpenAI configuration is complete");
  }

  getConfig() {
    return {
      channelAccessToken: this.channelAccessToken,
      channelSecret: this.channelSecret,
      openaiApiKey: this.openaiApiKey,
    };
  }
}

class LineWebHookReceiver {
  constructor(config) {
    this.config = config;
    this.router = express.Router();
    this.router.use("/webhook", express.raw({ type: "application/json" }));
    this.router.post("/webhook", this.handleWebhook.bind(this));
  }

  validateSignature(req) {
    const signature = req.get("x-line-signature");
    if (!signature) {
      console.error("❌ Missing x-line-signature header");
      return false;
    }

    const expectedSignature = crypto
      .createHmac("SHA256", this.config.channelSecret)
      .update(req.body)
      .digest("base64");

    if (signature !== expectedSignature) {
      console.error("❌ Signature validation failed");
      return false;
    }

    return true;
  }

  async handleWebhook(req, res) {
    console.log("=== WEBHOOK REQUEST RECEIVED ===");
    if (!this.validateSignature(req)) {
      return res.status(401).send("Signature validation failed");
    }

    try {
      const body = JSON.parse(req.body.toString());
      const events = body.events;

      if (events && events.length > 0) {
        console.log(`Processing ${events.length} events`);
        await Promise.all(events.map((event) => this.handleEvent(event, res)));
      } else {
        res.status(200).send("OK");
      }
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  async handleEvent(event, res) {
    const logger = new LineWebHookDataLogger();
    logger.logEvent(event);

    const replier = new LineWebHookReplier(this.config);
    try {
      await replier.replyToEvent(event);
      res.status(200).send("OK");
    } catch (error) {
      console.error("Event handling error:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  getRouter() {
    return this.router;
  }
}

class LineWebHookReplier {
  constructor(config) {
    this.client = new line.Client({
      channelAccessToken: config.channelAccessToken,
    });
    this.proxy = new ChatbotProxy(); // Proxy to handle chatbot communication
  }

  async replyToEvent(event) {
    if (event.type !== "message" || event.message.type !== "text") {
      console.log("Ignoring non-text message");
      return Promise.resolve(null);
    }

    console.log(
      "Received message:",
      event.message.text,
      "from user:",
      event.source.userId
    );

    try {
      // Use the proxy to get a reply from the chatbot
      const chatbotReply = await this.proxy.getReply(
        event.message.text,
        event.source.userId
      );
      const result = await this.client.replyMessage(event.replyToken, [
        { type: "text", text: chatbotReply },
      ]);
      console.log("✅ Reply sent successfully");
      return result;
    } catch (error) {
      console.error("❌ Failed to send reply:", error);
      throw error;
    }
  }
}

class ChatbotProxy {
  constructor() {
    this.openaiService = require("../services/OpenAIChatbotService.js");
  }

  async getReply(userMessage, userId) {
    const chatbotReply = await this.openaiService.chat(userId, userMessage);

    // If the reply contains a ticket number, reset memory
    if (/REQ-\d{8}-\d+/i.test(chatbotReply)) {
      // Reset conversation history for this user
      this.openaiService.resetHistory(userId);
      console.log(`Conversation history reset for user: ${userId}`);
    }

    return chatbotReply;
  }
}

class LineWebHookDataLogger {
  logEvent(event) {
    console.log("=== HANDLING EVENT ===");
    console.log("Event type:", event.type);
    console.log("Event:", JSON.stringify(event, null, 2));
  }
}

// Initialize configuration
const lineConfig = new LineConfig();
const config = lineConfig.getConfig();

// Export router
const receiver = new LineWebHookReceiver(config);
module.exports = receiver.getRouter();
