// server/routes/taskDefinition.routes.js

const express = require('express');
const taskDefinitionController = require('../controllers/taskDefinition.controller.js');
const protectRoute = require('../middleware/auth.middleware.js');

const router = express.Router();

// --- Define TaskDefinition Routes ---
// All routes are protected

// POST / - Create a new task definition
// Body includes details like type, daysOfWeek, startTime, courseId
router.post('/', protectRoute, taskDefinitionController.createTaskDefinition);

// GET / - Get all task definitions for the user
// Requires courseId as a query parameter (e.g., /?courseId=...)
router.get('/', protectRoute, taskDefinitionController.getTaskDefinitions);

// GET /:taskDefinitionId - Get a specific task definition by ID
router.get('/:taskDefinitionId', protectRoute, taskDefinitionController.getTaskDefinitionById);

// PUT /:taskDefinitionId - Update a specific task definition by ID
router.put('/:taskDefinitionId', protectRoute, taskDefinitionController.updateTaskDefinition);

// DELETE /:taskDefinitionId - Delete a specific task definition by ID
router.delete('/:taskDefinitionId', protectRoute, taskDefinitionController.deleteTaskDefinition);


// Export the router
module.exports = router; 