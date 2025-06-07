const express = require('express');
const router = express.Router();
const { loginAdmin } = require('../controllers/adminUserController');
const { signupAdmin } = require('../controllers/adminUserSignupController');

// Login admin user
router.post('/login', async (req, res) => {
  try {
    await loginAdmin(req, res);
  } catch (err) {
    console.error('Admin login error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Signup admin user
router.post('/signup-admin', async (req, res) => {
  try {
    await signupAdmin(req, res);
  } catch (err) {
    console.error('Admin signup error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

module.exports = router;