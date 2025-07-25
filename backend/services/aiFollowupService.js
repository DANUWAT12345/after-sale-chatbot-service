// backend/services/aiFollowupService.js
// Mediator for AI follow-up to collect missing ticket fields

/**
 * Collects missing ticket fields using AI follow-up, returns ticketToSave, missingFields, and ticketDataIter.
 * @param {Object} params
 * @param {Object} params.ticketData - Initial ticket data
 * @param {string} params.ticketNumber - Ticket number
 * @param {string} params.userId - User ID
 * @param {Object} params.chatbotService - Chatbot service instance
 * @returns {Promise<{ticketToSave: Object, missingFields: string[], ticketDataIter: Object}>}
 */
async function collectMissingTicketFields({ ticketData, ticketNumber, userId, chatbotService }) {
  const requiredFields = [
    "ticket_number",
    "user_id",
    "request_for",
    "tel",
    "urgency",
    "status",
  ];
  const ticketToSave = {};
  let missingFields = [];

  requiredFields.forEach((field) => {
    if (field === "ticket_number") ticketToSave[field] = ticketNumber;
    else if (field === "user_id") ticketToSave[field] = userId;
    else ticketToSave[field] = ticketData[field] || "";
    if (!ticketToSave[field] && field !== "status") {
      missingFields.push(field);
    }
  });

  // Set default status if not provided
  if (!ticketToSave.status) {
    ticketToSave.status = "open";
  }

  let ticketDataIter = { ...ticketToSave };

  if (missingFields.length > 0) {
    const maxTries = 3;
    let tries = 0;
    while (missingFields.length > 0 && tries < maxTries) {
      tries++;
      const aiPrompt = `SYSTEM_REQUEST_JSON_DATA\nMissing fields: ${missingFields.join(", ")}\nProvide JSON format with these fields: request_for, tel, urgency`;
      try {
        const aiFollowup = await chatbotService.getReply(userId, aiPrompt);
        const jsonMatch = aiFollowup.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const aiJson = JSON.parse(jsonMatch[0]);
          for (const field of missingFields) {
            if (aiJson[field] && aiJson[field].trim()) {
              ticketDataIter[field] = aiJson[field].trim();
            }
          }
        }
      } catch (e) {
        // log error if needed
      }
      missingFields = requiredFields.filter(
        (field) => field !== "status" && (!ticketDataIter[field] || !ticketDataIter[field].trim())
      );
    }
  }
  return { ticketToSave, missingFields, ticketDataIter };
}

module.exports = { collectMissingTicketFields };
