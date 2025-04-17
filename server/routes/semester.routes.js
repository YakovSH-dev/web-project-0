// server/routes/semester.routes.js

const express = require('express');
const semesterController = require('../controllers/semester.controller.js');
const protectRoute = require('../middleware/auth.middleware.js'); // Import the authentication middleware

// Create a new router instance
const router = express.Router();

// --- Define Semester Routes ---

// POST / - Create a new semester (Protected Route)
// protectRoute middleware runs first to verify JWT and attach req.user
router.post('/', protectRoute, semesterController.createSemester);

// GET / - Get all semesters for the logged-in user (Protected Route)
router.get('/', protectRoute, semesterController.getSemesters);

// --- Add other semester routes later (e.g., GET /:id, PUT /:id, DELETE /:id) ---
// Example: router.get('/:id', protectRoute, semesterController.getSemesterById);

// Export the configured router
module.exports = router;
