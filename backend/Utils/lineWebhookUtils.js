// backend/Utils/lineWebhookUtils.js
const crypto = require('crypto');
const config = require('../config/appConfig');

function validateSignature(req, channelSecret) {
  const signature = req.get('x-line-signature');
  if (!signature) {
    console.error('❌ Missing x-line-signature header');
    return false;
  }
  const expectedSignature = crypto
    .createHmac('SHA256', channelSecret)
    .update(req.body)
    .digest('base64');
  if (signature !== expectedSignature) {
    console.error('❌ Signature validation failed');
    return false;
  }
  return true;
}

function parseLineWebhookBody(req) {
  try {
    return JSON.parse(req.body.toString());
  } catch (e) {
    console.error('Failed to parse LINE webhook body:', e);
    return null;
  }
}

module.exports = { validateSignature, parseLineWebhookBody };
