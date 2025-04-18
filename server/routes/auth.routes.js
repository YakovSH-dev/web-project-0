// server/routes/auth.routes.js

const express = require('express');
// Import the authentication controller
const authController = require('../controllers/auth.controller.js');
// Import the protectRoute middleware
const protectRoute = require('../middleware/protectRoute.js');

// Create a new router instance
const router = express.Router();

// --- Define Authentication Routes ---

// POST /signup - Route definition points to the signup controller function
router.post('/signup', authController.signup);

// POST /login - Route definition points to the login controller function
router.post('/login', authController.login);

// GET /me - Fetch the profile of the logged-in user
router.get('/me', protectRoute, authController.getMe);

// --- Add other auth routes here later ---
// Example: router.post('/logout', authController.logout);

// Export the configured router directly
module.exports = router; 
