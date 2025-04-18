// server/routes/taskInstance.routes.js

const express = require('express');
const taskInstanceController = require('../controllers/taskInstance.controller.js');
const protectRoute = require('../middleware/auth.middleware.js');

const router = express.Router();

// --- Define TaskInstance Routes ---
// All routes are protected

// POST / - Create a new task instance (Manual creation)
router.post('/', protectRoute, taskInstanceController.createTaskInstance);

// GET / - Get task instances for the user
// Supports query parameters for filtering:
// - taskDefinitionId=...
// - startDate=YYYY-MM-DD
// - endDate=YYYY-MM-DD
router.get('/', protectRoute, taskInstanceController.getTaskInstances);

// GET /:taskInstanceId - Get a specific task instance by ID
router.get('/:taskInstanceId', protectRoute, taskInstanceController.getTaskInstanceById);

// PUT /:taskInstanceId - Update a specific task instance by ID
// Used for marking complete, adding description, levelOfUnderstanding, etc.
router.put('/:taskInstanceId', protectRoute, taskInstanceController.updateTaskInstance);

// DELETE /:taskInstanceId - Delete a specific task instance by ID
router.delete('/:taskInstanceId', protectRoute, taskInstanceController.deleteTaskInstance);

// Note: Route for triggering instance generation based on definitions might be added later.


// Export the router
module.exports = router; 