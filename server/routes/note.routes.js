// server/routes/note.routes.js

const express = require('express');
const noteController = require('../controllers/note.controller.js');
const protectRoute = require('../middleware/auth.middleware.js');

const router = express.Router();

// --- Define Note Routes ---
// All routes are protected

// POST / - Create a new note for a specific task instance
// Body includes description, taskInstanceId, etc.
router.post('/', protectRoute, noteController.createNote);

// GET / - Get all notes for the user
// Requires taskInstanceId as a query parameter (e.g., /?taskInstanceId=...)
router.get('/', protectRoute, noteController.getNotes);

// GET /:noteId - Get a specific note by ID
router.get('/:noteId', protectRoute, noteController.getNoteById);

// PUT /:noteId - Update a specific note by ID
router.put('/:noteId', protectRoute, noteController.updateNote);

// DELETE /:noteId - Delete a specific note by ID
router.delete('/:noteId', protectRoute, noteController.deleteNote);


// Export the router
module.exports = router; 