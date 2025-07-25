// backend/Utils/ticketParseUtil.js
/**
 * Extracts the ticket number from a reply string.
 * Supports formats: TK-YYYYMMDD-XXX or REQ-YYYYMMDD-XXX
 * @param {string} reply
 * @returns {string|null}
 */
function extractTicketNumber(reply) {
  let ticketMatch = reply.match(/TK-\d{8}-\d{3}/);
  if (!ticketMatch) {
    ticketMatch = reply.match(/REQ-\d{8}-\d{3}/);
  }
  return ticketMatch ? ticketMatch[0] : null;
}

/**
 * Attempts to extract a JSON object from a reply string.
 * @param {string} reply
 * @returns {object|null}
 */
function extractTicketData(reply) {
  try {
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (e) {
    return null;
  }
}

module.exports = {
  extractTicketNumber,
  extractTicketData,
};
