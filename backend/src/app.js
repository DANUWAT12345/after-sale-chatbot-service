// 1. Load environment variables from .env file
//    This allows us to use variables like PORT without hardcoding them.
require('dotenv').config();

// 2. Import the Express framework
const express = require('express');
const app = express(); // Create an Express application instance

// 3. Define the port for the server
//    It tries to use the PORT environment variable (useful for deployment)
//    or defaults to 3000 if not found.
const PORT = process.env.PORT || 3000;

// 4. Import Microservice Routers
//    We require the 'index.js' file from our 'line-webhook-service' folder.
//    By default, Node.js looks for 'index.js' when you require a directory.
const lineWebhookServiceRouter = require('./line-webhook-service');

// 5. Global Middleware
//    app.use() applies middleware to all incoming requests.
//    express.json() is crucial for parsing JSON payloads from incoming requests
//    (e.g., from Line's webhook).
app.use(express.json());

// 6. Mount Microservice Routes
//    This tells the main Express app to use the 'lineWebhookServiceRouter'
//    for any requests that start with '/line'.
//    So, a request to '/line/webhook' will be handled by our line-webhook-service.
app.use('/line', lineWebhookServiceRouter);

// 7. Basic Test Route
//    A simple GET endpoint to confirm the server is running.
app.get('/', (req, res) => {
  res.send('Welcome to the Post-Sale Chatbot API!');
});

// 8. Start the server
//    The app listens for incoming HTTP requests on the defined PORT.
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access root via http://localhost:${PORT}`);
  console.log(`Line webhook endpoint: http://localhost:${PORT}/line/webhook`);
});