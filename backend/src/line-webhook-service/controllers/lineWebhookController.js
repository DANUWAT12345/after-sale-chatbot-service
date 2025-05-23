// backend/src/line-webhook-service/controllers/lineWebhookController.js

class LineWebhookController {
    /**
     * Static method to handle incoming Line webhook events.
     * Static methods are called directly on the class (e.g., LineWebhookController.handleWebhook)
     * without needing to create an instance of the class. This is common for controllers.
     * 'async' keyword indicates that this function will perform asynchronous operations (e.g.,
     * sending messages back to Line, saving to DB), though currently it only logs.
     *
     * @param {Object} req - The Express request object, containing the Line webhook payload.
     * @param {Object} res - The Express response object, used to send a response back to Line.
     */
    static async handleWebhook(req, res) {
      // Log the received event for debugging.
      // JSON.stringify(req.body, null, 2) formats the JSON for readability in the console.
      console.log('Received Line Webhook Event:', JSON.stringify(req.body, null, 2));
  
      // Acknowledge receipt of the webhook.
      // Line expects a 200 OK response quickly. If we don't send it, Line might retry.
      res.status(200).send('OK 200');
  
      // --- Future enhancements will go here ---
      // In later steps, we will:
      // 1. Verify the Line signature to ensure the request is from Line.
      // 2. Parse the event objects from req.body.events.
      // 3. Determine the type of event (message, follow, unfollow, etc.).
      // 4. If it's a message event:
      //    a. Extract the user's message and user ID.
      //    b. Potentially call a LineWebhookService to handle the message (e.g., send to Gemini AI).
      //    c. Send a reply back to Line.
      // 5. If it's a photo, handle the photo URL/data.
    }
  }
  
  // Export the class so it can be imported and used by the router.
  module.exports = LineWebhookController;