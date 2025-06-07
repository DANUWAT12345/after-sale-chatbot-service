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

    // Check for ticket issued keyword
    if (reply.includes("รับแจ้งเรื่องเรียบร้อยค่ะ")) {
      console.log("=== TICKET CREATION DETECTED ===");
      
      // Extract ticket number (format: TK-YYYYMMDD-XXX or REQ-YYYYMMDD-XXX)
      let ticketMatch = reply.match(/TK-\d{8}-\d{3}/);
      if (!ticketMatch) {
        ticketMatch = reply.match(/REQ-\d{8}-\d{3}/);
      }
      
      const ticketNumber = ticketMatch ? ticketMatch[0] : null;
      console.log("Extracted ticket number:", ticketNumber);
      
      if (ticketNumber) {
        // Parse AI reply for ticket fields
        let ticketData = {};
        try {
          // Try to extract JSON from reply
          const jsonMatch = reply.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            ticketData = JSON.parse(jsonMatch[0]);
            console.log("Parsed ticket data from AI reply:", ticketData);
          } else {
            console.log("No JSON found in AI reply, will need to collect data");
          }
        } catch (e) {
          console.warn('Could not parse ticket data from AI reply:', e.message);
        }

        // Always include ticket number and user id
        ticketData.ticket_number = ticketNumber;
        ticketData.user_id = event.source.userId;
        
        // Ensure all required fields are present
        const requiredFields = ['ticket_number', 'user_id', 'request_for', 'tel', 'urgency', 'status'];
        const ticketToSave = {};
        let missingFields = [];
        
        requiredFields.forEach(field => {
          ticketToSave[field] = ticketData[field] || '';
          if (!ticketToSave[field] && field !== 'status') {
            missingFields.push(field);
          }
        });
        
        // Set default status if not provided
        if (!ticketToSave.status) {
          ticketToSave.status = 'open';
        }

        console.log("Initial ticket data:", ticketToSave);
        console.log("Missing fields:", missingFields);

        // If any required fields are missing, try to collect them
        if (missingFields.length > 0) {
          console.log("=== COLLECTING MISSING TICKET DATA ===");
          
          const maxTries = 3;
          let tries = 0;
          let ticketDataIter = { ...ticketToSave };
          
          while (missingFields.length > 0 && tries < maxTries) {
            tries++;
            console.log(`[Attempt ${tries}/${maxTries}] Missing fields:`, missingFields);
            
            const aiPrompt = `SYSTEM_REQUEST_JSON_DATA\nMissing fields: ${missingFields.join(', ')}\nProvide JSON format with these fields: request_for, tel, urgency`;
            
            try {
              const aiFollowup = await chatbotService.getReply(event.source.userId, aiPrompt);
              console.log(`[AI follow-up ${tries}/${maxTries}]:`, aiFollowup);
              
              // Try to extract JSON from AI followup
              const jsonMatch = aiFollowup.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const aiJson = JSON.parse(jsonMatch[0]);
                console.log("Parsed follow-up data:", aiJson);
                
                // Update missing fields
                for (const field of missingFields) {
                  if (aiJson[field] && aiJson[field].trim()) {
                    ticketDataIter[field] = aiJson[field].trim();
                  }
                }
              } else {
                console.warn("No JSON found in AI follow-up response");
              }
            } catch (e) {
              console.error('Error in AI follow-up:', e.message);
            }
            
            // Recompute missing fields (excluding status)
            missingFields = requiredFields.filter(field => 
              field !== 'status' && (!ticketDataIter[field] || !ticketDataIter[field].trim())
            );
            
            console.log("Updated ticket data:", ticketDataIter);
            console.log("Remaining missing fields:", missingFields);
          }
          
          // Try to save ticket regardless of completeness (log what's missing)
          if (missingFields.length > 0) {
            console.warn(`Saving incomplete ticket. Missing fields: ${missingFields.join(', ')}`);
          }
          
          // Attempt to save ticket to DB
          try {
            const TicketModel = require('../model/TicketModel');
            await TicketModel.createTicket(ticketDataIter);
            console.log('✅ Ticket saved to DB:', ticketDataIter);
            
            // Print ticket summary
            console.log('=== TICKET ISSUED ===');
            console.log('Ticket Number:', ticketNumber);
            console.log('User ID:', event.source.userId);
            console.log('Ticket Data:', ticketDataIter);
            console.log('====================');
            
            // Reset chat history after successful save
            const ChatHistoryModel = require('../model/ChatHistoryModel');
            await ChatHistoryModel.resetHistory(event.source.userId);
            console.log('Chat history reset for user:', event.source.userId);
            
            // Switch model mode (if this functionality exists)
            try {
              chatbotService.switchModel('console');
              console.log('Chatbot model switched to console mode');
            } catch (e) {
              console.warn('Could not switch chatbot model:', e.message);
            }
            
            // Don't send the original AI reply, send a confirmation instead
            const confirmationMessage = `ได้ออกตั๋วแจ้งปัญหาเรียบร้อยแล้ว\nหมายเลขตั๋ว: ${ticketNumber}\nทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง`;
            
            await lineBotClient.replyMessage(event.replyToken, [
              { type: "text", text: confirmationMessage },
            ]);
            console.log("✅ Confirmation message sent to user");
            
            return;
            
          } catch (err) {
            console.error('❌ Failed to save ticket to DB:', err.message);
            console.error('Stack trace:', err.stack);
            
            // Send error message to user
            const errorMessage = "เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง";
            await lineBotClient.replyMessage(event.replyToken, [
              { type: "text", text: errorMessage },
            ]);
            
            return;
          }
        } else {
          // All fields present, save directly
          try {
            const TicketModel = require('../model/TicketModel');
            await TicketModel.createTicket(ticketToSave);
            console.log('✅ Ticket saved to DB (all fields present):', ticketToSave);
            
            // Print ticket summary
            console.log('=== TICKET ISSUED ===');
            console.log('Ticket Number:', ticketNumber);
            console.log('User ID:', event.source.userId);
            console.log('Ticket Data:', ticketToSave);
            console.log('====================');
            
            // Reset chat history
            const ChatHistoryModel = require('../model/ChatHistoryModel');
            await ChatHistoryModel.resetHistory(event.source.userId);
            
            // Switch model mode
            try {
              chatbotService.switchModel('console');
            } catch (e) {
              console.warn('Could not switch chatbot model:', e.message);
            }
            
            // Send confirmation
            const confirmationMessage = `ได้ออกตั๋วแจ้งปัญหาเรียบร้อยแล้ว\nหมายเลขตั๋ว: ${ticketNumber}\nทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง`;
            
            await lineBotClient.replyMessage(event.replyToken, [
              { type: "text", text: confirmationMessage },
            ]);
            console.log("✅ Confirmation message sent to user");
            
            return;
            
          } catch (err) {
            console.error('❌ Failed to save ticket to DB:', err.message);
            
            // Send error message to user
            const errorMessage = "เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง";
            await lineBotClient.replyMessage(event.replyToken, [
              { type: "text", text: errorMessage },
            ]);
            
            return;
          }
        }
      } else {
        console.warn("Ticket keyword detected but no ticket number found in reply");
        // If chat history was reset (e.g., after a restart), ask user to try again
        // Optionally, notify the user
        const ChatHistoryModel = require('../model/ChatHistoryModel');
        await ChatHistoryModel.resetHistory(event.source.userId);
        const errorMessage = "ขออภัยค่ะ ระบบไม่สามารถออกเลขที่คำร้องได้ กรุณาลองใหม่อีกครั้ง";
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