// server/routes/assignment.routes.js

const express = require('express');
const assignmentController = require('../controllers/assignment.controller.js');
const protectRoute = require('../middleware/auth.middleware.js'); // Import auth middleware

const router = express.Router();

// --- Define Assignment Routes ---
// All routes are protected and assume user context is available via protectRoute

// POST / - Create a new assignment
// Body should contain assignment details including courseId
router.post('/', protectRoute, assignmentController.createAssignment);

// GET / - Get all assignments for the logged-in user
// Requires courseId as a query parameter (e.g., /?courseId=...)
router.get('/', protectRoute, assignmentController.getAssignments);

// GET /:assignmentId - Get a specific assignment by its ID
router.get('/:assignmentId', protectRoute, assignmentController.getAssignmentById);

// PUT /:assignmentId - Update a specific assignment by its ID
// Body should contain fields to update
router.put('/:assignmentId', protectRoute, assignmentController.updateAssignment);

// DELETE /:assignmentId - Delete a specific assignment by its ID
router.delete('/:assignmentId', protectRoute, assignmentController.deleteAssignment);


// Export the configured router
module.exports = router; 