const express = require('express');
const viewController = require('../controllers/view.controller.js');
const protectRoute = require('../middleware/auth.middleware.js');

const router = express.Router();

// --- Define View Data Routes ---
// All routes are protected

// GET /upcoming - Get upcoming assignments (query params for filtering)
router.get('/upcoming', protectRoute, viewController.getUpcomingAssignments);

// GET /gaps - Get past uncompleted task instances (query params for filtering)
router.get('/gaps', protectRoute, viewController.getGapsData);

// GET /daily - Get task instances for a specific day (query params for date)
router.get('/daily', protectRoute, viewController.getDailyViewData);

// GET /weekly - Get task instances for a specific week, structured (query params for week start)
router.get('/weekly', protectRoute, viewController.getWeeklyViewData);

// GET /semester - Get task instances for a whole semester, structured (query params for semesterId)
router.get('/semester', protectRoute, viewController.getSemesterViewData);


// Export the router
module.exports = router; 