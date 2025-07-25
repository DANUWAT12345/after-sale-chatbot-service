// backend/services/lineWebhookService.js
const {
  validateSignature,
  parseLineWebhookBody,
} = require("../Utils/lineWebhookUtils");
const chatbotService = require("../AIServices/chatbotService");

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
      await Promise.all(
        events.map((event) => handleEvent(event, chatbotService, lineBotClient))
      );
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

    // Check for ticket issued keyword
    if (reply.includes("รับแจ้งเรื่องเรียบร้อยค่ะ")) {
      console.log("=== TICKET CREATION DETECTED ===");

      // Use ticketParseUtil for extraction
      const {
        extractTicketNumber,
        extractTicketData,
      } = require("../Utils/ticketParseUtil");
      const ticketNumber = extractTicketNumber(reply);
      const ticketData = extractTicketData(reply) || {};

      if (ticketNumber) {

        // Use aiFollowupService to handle missing fields and AI follow-up
        const aiFollowupService = require("./aiFollowupService");
        const { ticketToSave, missingFields, ticketDataIter } = await aiFollowupService.collectMissingTicketFields({
          ticketData,
          ticketNumber,
          userId: event.source.userId,
          chatbotService
        });

        // If there are still missing fields after AI follow-up, log a warning
        if (missingFields.length > 0) {
          console.warn(
            `Saving incomplete ticket. Missing fields: ${missingFields.join(", ")}`
          );
        }

        // Save ticket using the most complete data (ticketDataIter)
        try {
          const TicketModel = require("../model/TicketModel");
          await TicketModel.createTicket(ticketDataIter);
          console.log("✅ Ticket saved to DB:", ticketDataIter);

          // Print ticket summary
          console.log("=== TICKET ISSUED ===");
          console.log("Ticket Number:", ticketNumber);
          console.log("User ID:", event.source.userId);
          console.log("Ticket Data:", ticketDataIter);
          console.log("====================");

          // Reset chat history after successful save
          const ChatHistoryModel = require("../model/ChatHistoryModel");
          await ChatHistoryModel.resetHistory(event.source.userId);
          console.log("Chat history reset for user:", event.source.userId);

          // Switch model mode (if this functionality exists)
          try {
            chatbotService.switchModel("console");
            console.log("Chatbot model switched to console mode");
          } catch (e) {
            console.warn("Could not switch chatbot model:", e.message);
          }

          // Send confirmation
          const confirmationMessage = `ได้ออกตั๋วแจ้งปัญหาเรียบร้อยแล้ว\nหมายเลขตั๋ว: ${ticketNumber}\nทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง`;

          await lineBotClient.replyMessage(event.replyToken, [
            { type: "text", text: confirmationMessage },
          ]);
          console.log("✅ Confirmation message sent to user");

          return;
        } catch (err) {
          console.error("❌ Failed to save ticket to DB:", err.message);
          console.error("Stack trace:", err.stack);

          // Send error message to user
          const errorMessage =
            "เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง";
          await lineBotClient.replyMessage(event.replyToken, [
            { type: "text", text: errorMessage },
          ]);

          return;
        }
      } else {
        console.warn(
          "Ticket keyword detected but no ticket number found in reply"
        );
        // If chat history was reset (e.g., after a restart), ask user to try again
        // Optionally, notify the user
        const ChatHistoryModel = require("../model/ChatHistoryModel");
        await ChatHistoryModel.resetHistory(event.source.userId);
        const errorMessage =
          "ขออภัยค่ะ ระบบไม่สามารถออกเลขที่คำร้องได้ กรุณาลองใหม่อีกครั้ง";
        await lineBotClient.replyMessage(event.replyToken, [
          { type: "text", text: errorMessage },
        ]);
        return;
      }
    }

    // Normal message flow - send AI reply
    const result = await lineBotClient.replyMessage(event.replyToken, [
      { type: "text", text: reply },
    ]);
    console.log("✅ Reply sent successfully");
    return result;
  } catch (error) {
    console.error("❌ Failed to process message:", error);
    console.error("Stack trace:", error.stack);

    // Send generic error message to user
    try {
      await lineBotClient.replyMessage(event.replyToken, [
        { type: "text", text: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" },
      ]);
    } catch (replyError) {
      console.error("❌ Failed to send error message:", replyError);
    }

    throw error;
  }
}

module.exports = {
  processWebhookRequest,
  handleEvent,
};
