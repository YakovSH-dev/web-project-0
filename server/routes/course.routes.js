// server/routes/course.routes.js

const express = require('express');
const courseController = require('../controllers/course.controller.js');
const protectRoute = require('../middleware/auth.middleware.js'); // Import auth middleware

const router = express.Router();

// --- Define Course Routes ---
// All these routes are protected by the protectRoute middleware

// POST / - Create a new course
router.post('/', protectRoute, courseController.createCourse);

// GET / - Get all courses for the logged-in user (filtered by semesterId query param)
router.get('/', protectRoute, courseController.getCourses);

// GET /:courseId - Get a specific course by its ID
router.get('/:courseId', protectRoute, courseController.getCourseById);

// PUT /:courseId - Update a specific course by its ID
// Using PUT, expects the full updated object. Use PATCH for partial updates.
router.put('/:courseId', protectRoute, courseController.updateCourse); 

// DELETE /:courseId - Delete a specific course by its ID
router.delete('/:courseId', protectRoute, courseController.deleteCourse);


// Export the configured router
module.exports = router;
