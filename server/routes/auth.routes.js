// server/routes/auth.routes.js

const express = require('express');
// Import the authentication controller
const authController = require('../controllers/auth.controller.js');

// Create a new router instance
const router = express.Router();

// --- Define Authentication Routes ---

// POST /signup - Route definition now points to the controller function
// The actual logic is handled in authController.signup
router.post('/signup', authController.signup);

// --- Add other auth routes here later and point them to controller functions ---
// Example: router.post('/login', authController.login);

module.exports = router; 