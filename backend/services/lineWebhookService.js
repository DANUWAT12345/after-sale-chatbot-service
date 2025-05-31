// backend/services/lineWebhookService.js
const { validateSignature, parseLineWebhookBody } = require('../Utils/lineWebhookUtils');
const chatbotService = require('../AIServices/chatbotService');

/**
 * Handles the incoming LINE webhook request: validates signature, parses body, and dispatches events.
 */
async function processWebhookRequest(req, res, lineConfig, lineBotClient) {
  console.log("=== WEBHOOK REQUEST RECEIVED ===");
  if (!validateSignature(req, lineConfig.channelSecret)) {
    return res.status(401).send("Signature validation failed");
  }

  try {
    const body = parseLineWebhookBody(req);
    if (!body) {
      return res.status(400).send("Invalid request body");
    }
    const events = body.events;

    if (events && events.length > 0) {
      console.log(`Processing ${events.length} events`);
      await Promise.all(events.map((event) => handleEvent(event, chatbotService, lineBotClient)));
    }
    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).send("Internal Server Error");
  }
}

/**
 * Handles a single LINE event (currently only text messages).
 */
async function handleEvent(event, chatbotService, lineBotClient) {
  console.log("=== HANDLING EVENT ===");
  console.log("Event type:", event.type);
  console.log("Event:", JSON.stringify(event, null, 2));

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
    const reply = await chatbotService.getReply(
      event.source.userId,
      event.message.text
    );
    const result = await lineBotClient.replyMessage(event.replyToken, [
      { type: "text", text: reply },
    ]);
    console.log("✅ Reply sent successfully");
    return result;
  } catch (error) {
    console.error("❌ Failed to send reply:", error);
    throw error;
  }
}

module.exports = {
  processWebhookRequest,
  handleEvent,
};
