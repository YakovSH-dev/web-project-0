// server/controllers/semester.controller.js

const Semester = require('../models/Semester.model.js');

// Controller function to create a new semester for the logged-in user
const createSemester = async (req, res) => {
  console.log(`Processing createSemester request for user: ${req.user?.userId}`); // Log user ID from middleware

  try {
    // Get semester details from request body
    const { name, startDate, numberOfWeeks } = req.body;

    // Basic validation
    if (!name || !startDate || !numberOfWeeks) {
      return res.status(400).json({ message: 'Missing required fields: name, startDate, numberOfWeeks' });
    }

    // Ensure user information is attached by auth middleware
    if (!req.user || !req.user.userId) {
       console.error('Error creating semester: User ID not found on request object. Is auth middleware running?');
       return res.status(401).json({ message: 'Not authorized' }); 
    }

    // Create new semester instance, associating it with the logged-in user
    const newSemester = new Semester({
      name,
      startDate,
      numberOfWeeks,
      userId: req.user.userId // Get user ID from the middleware
    });

    // Save the semester to the database
    const savedSemester = await newSemester.save();
    console.log(`Semester created successfully with _id: ${savedSemester._id} for user: ${req.user.userId}`);

    // Send success response (201 Created) with the created semester data
    res.status(201).json(savedSemester);

  } catch (error) {
    console.error('Error creating semester:', error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ message: 'Server error while creating semester', error: error.message });
  }
};

// Controller function to get all semesters for the logged-in user
const getSemesters = async (req, res) => {
  console.log(`Processing getSemesters request for user: ${req.user?.userId}`);

  try {
     // Ensure user information is attached by auth middleware
    if (!req.user || !req.user.userId) {
       console.error('Error getting semesters: User ID not found on request object. Is auth middleware running?');
       return res.status(401).json({ message: 'Not authorized' }); 
    }

    // Find all semesters belonging to the logged-in user
    // Sort by start date descending (newest first)
    const semesters = await Semester.find({ userId: req.user.userId }).sort({ startDate: -1 });
    console.log(`Found ${semesters.length} semesters for user: ${req.user.userId}`);

    // Send success response (200 OK) with the list of semesters
    res.status(200).json(semesters);

  } catch (error) {
    console.error('Error fetching semesters:', error);
    res.status(500).json({ message: 'Server error while fetching semesters', error: error.message });
  }
};

// --- Add other semester controller functions later (e.g., getSemesterById, updateSemester, deleteSemester) ---

// Export the controller functions
module.exports = {
  createSemester,
  getSemesters,
};
