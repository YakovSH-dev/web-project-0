// server/controllers/course.controller.js

const Course = require('../models/Course.model.js');
const Semester = require('../models/Semester.model.js'); // Needed to verify semester ownership

// --- Create Course ---
const createCourse = async (req, res) => {
  console.log(`Processing createCourse request for user: ${req.user?.userId}`);
  try {
    const { name, color, instructor, description, links, semesterId } = req.body;
    const userId = req.user.userId; // Get userId from auth middleware

    // Basic validation
    if (!name || !semesterId) {
      return res.status(400).json({ message: 'Missing required fields: name, semesterId' });
    }

    // **Important: Verify the user owns the semester they're adding the course to**
    const semester = await Semester.findOne({ _id: semesterId, userId: userId });
    if (!semester) {
      console.log(`Create course failed: Semester ${semesterId} not found or not owned by user ${userId}`);
      return res.status(404).json({ message: 'Semester not found or access denied' });
    }

    // Create new course instance
    const newCourse = new Course({
      name,
      color,
      instructor,
      description,
      links,
      semesterId, // Link to the semester
      userId,     // Link to the user
    });

    // Save the course
    const savedCourse = await newCourse.save();
    console.log(`Course created successfully with _id: ${savedCourse._id} for user: ${userId}`);
    res.status(201).json(savedCourse);

  } catch (error) {
    console.error('Error creating course:', error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ message: 'Server error while creating course', error: error.message });
  }
};

// --- Get Courses (e.g., for a specific semester) ---
const getCourses = async (req, res) => {
  console.log(`Processing getCourses request for user: ${req.user?.userId}`);
  try {
    const userId = req.user.userId;
    const { semesterId } = req.query; // Get semesterId from query parameter ?semesterId=...

    if (!semesterId) {
        return res.status(400).json({ message: 'semesterId query parameter is required' });
    }

    // Find courses matching the semesterId AND belonging to the logged-in user
    const courses = await Course.find({ semesterId: semesterId, userId: userId }).sort({ name: 1 }); // Sort alphabetically
    console.log(`Found ${courses.length} courses for semester ${semesterId}, user: ${userId}`);
    res.status(200).json(courses);

  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Server error while fetching courses', error: error.message });
  }
};

// --- Get Single Course by ID ---
const getCourseById = async (req, res) => {
  console.log(`Processing getCourseById request for user: ${req.user?.userId}, courseId: ${req.params.courseId}`);
  try {
    const userId = req.user.userId;
    const { courseId } = req.params; // Get courseId from URL parameter /:courseId

    const course = await Course.findOne({ _id: courseId, userId: userId });

    if (!course) {
      console.log(`Course not found or access denied for courseId: ${courseId}, user: ${userId}`);
      return res.status(404).json({ message: 'Course not found or access denied' });
    }

    console.log(`Course found: ${courseId}`);
    res.status(200).json(course);

  } catch (error) {
    console.error(`Error fetching course ${req.params.courseId}:`, error);
     if (error.name === 'CastError') { // Handle invalid ObjectId format
        return res.status(400).json({ message: 'Invalid course ID format' });
    }
    res.status(500).json({ message: 'Server error while fetching course', error: error.message });
  }
};

// --- Update Course by ID ---
const updateCourse = async (req, res) => {
  console.log(`Processing updateCourse request for user: ${req.user?.userId}, courseId: ${req.params.courseId}`);
  try {
    const userId = req.user.userId;
    const { courseId } = req.params;
    const updateData = req.body; // Get updated fields from request body

    // Find the course and update it, ensuring it belongs to the user
    // { new: true } returns the updated document
    // { runValidators: true } ensures schema validation rules are applied on update
    const updatedCourse = await Course.findOneAndUpdate(
      { _id: courseId, userId: userId }, // Filter: find course by ID and ensure ownership
      updateData,                         // Data to update with
      { new: true, runValidators: true }  // Options
    );

    if (!updatedCourse) {
      console.log(`Update failed: Course not found or access denied for courseId: ${courseId}, user: ${userId}`);
      return res.status(404).json({ message: 'Course not found or access denied' });
    }

    console.log(`Course updated successfully: ${courseId}`);
    res.status(200).json(updatedCourse);

  } catch (error) {
    console.error(`Error updating course ${req.params.courseId}:`, error);
     if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
     if (error.name === 'CastError') { 
        return res.status(400).json({ message: 'Invalid course ID format' });
    }
    res.status(500).json({ message: 'Server error while updating course', error: error.message });
  }
};

// --- Delete Course by ID ---
const deleteCourse = async (req, res) => {
   console.log(`Processing deleteCourse request for user: ${req.user?.userId}, courseId: ${req.params.courseId}`);
   try {
    const userId = req.user.userId;
    const { courseId } = req.params;

    // Find the course and delete it, ensuring it belongs to the user
    const deletedCourse = await Course.findOneAndDelete({ _id: courseId, userId: userId });

    if (!deletedCourse) {
      console.log(`Delete failed: Course not found or access denied for courseId: ${courseId}, user: ${userId}`);
      return res.status(404).json({ message: 'Course not found or access denied' });
    }

    console.log(`Course deleted successfully: ${courseId}`);
    // Send success response (200 OK with message, or 204 No Content)
    res.status(200).json({ message: 'Course deleted successfully' }); 
    // Alternatively: res.status(204).send(); 

    // Note: Consider deleting related assignments, tasks, notes here too if needed (cascade delete logic)

  } catch (error) {
    console.error(`Error deleting course ${req.params.courseId}:`, error);
     if (error.name === 'CastError') { 
        return res.status(400).json({ message: 'Invalid course ID format' });
    }
    res.status(500).json({ message: 'Server error while deleting course', error: error.message });
  }
};


// Export all controller functions
module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};
