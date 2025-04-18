const Assignment = require('../models/Assignment.model.js');
const Course = require('../models/Course.model.js'); // Needed to verify course ownership

// --- Create Assignment ---
const createAssignment = async (req, res) => {
  console.log(`Processing createAssignment request for user: ${req.user?.userId}`);
  try {
    const { title, description, dueDate, links, files, isCompleted, courseId } = req.body;
    const userId = req.user.userId; // Get userId from auth middleware

    // Basic validation
    if (!title || !dueDate || !courseId) {
      return res.status(400).json({ message: 'Missing required fields: title, dueDate, courseId' });
    }

    // Verify the user owns the course they're adding the assignment to
    const course = await Course.findOne({ _id: courseId, userId: userId });
    if (!course) {
      console.log(`Create assignment failed: Course ${courseId} not found or not owned by user ${userId}`);
      return res.status(404).json({ message: 'Course not found or access denied' });
    }

    // Create new assignment instance
    const newAssignment = new Assignment({
      title,
      description,
      dueDate,
      links,
      files,
      isCompleted, // Note: Default is false in the model if not provided
      courseId,   // Link to the course
      userId,     // Link to the user
    });

    // Save the assignment
    const savedAssignment = await newAssignment.save();
    console.log(`Assignment created successfully with _id: ${savedAssignment._id} for user: ${userId}, course: ${courseId}`);
    res.status(201).json(savedAssignment);

  } catch (error) {
    console.error('Error creating assignment:', error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    // Handle potential CastError if courseId is invalid format, although findOne should handle it gracefully returning null
    if (error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid ID format provided.' });
    }
    res.status(500).json({ message: 'Server error while creating assignment', error: error.message });
  }
};

// --- Get Assignments (e.g., for a specific course) ---
const getAssignments = async (req, res) => {
  console.log(`Processing getAssignments request for user: ${req.user?.userId}`);
  try {
    const userId = req.user.userId;
    const { courseId } = req.query; // Get courseId from query parameter ?courseId=...

    // Validate courseId is provided
    if (!courseId) {
        return res.status(400).json({ message: 'courseId query parameter is required' });
    }

    // Find assignments matching the courseId AND belonging to the logged-in user
    // Sorting by dueDate is often useful for assignments
    const assignments = await Assignment.find({ courseId: courseId, userId: userId }).sort({ dueDate: 1 }); // Sort by due date ascending
    
    console.log(`Found ${assignments.length} assignments for course ${courseId}, user: ${userId}`);
    res.status(200).json(assignments);

  } catch (error) {
    console.error('Error fetching assignments:', error);
    // Handle potential CastError if courseId is invalid format
    if (error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid course ID format provided.' });
    }
    res.status(500).json({ message: 'Server error while fetching assignments', error: error.message });
  }
};

// --- Get Single Assignment by ID ---
const getAssignmentById = async (req, res) => {
  console.log(`Processing getAssignmentById request for user: ${req.user?.userId}, assignmentId: ${req.params.assignmentId}`);
  try {
    const userId = req.user.userId;
    const { assignmentId } = req.params; // Get assignmentId from URL parameter /:assignmentId

    const assignment = await Assignment.findOne({ _id: assignmentId, userId: userId });

    if (!assignment) {
      console.log(`Assignment not found or access denied for assignmentId: ${assignmentId}, user: ${userId}`);
      return res.status(404).json({ message: 'Assignment not found or access denied' });
    }

    console.log(`Assignment found: ${assignmentId}`);
    res.status(200).json(assignment);

  } catch (error) {
    console.error(`Error fetching assignment ${req.params.assignmentId}:`, error);
    if (error.name === 'CastError') { // Handle invalid ObjectId format
       return res.status(400).json({ message: 'Invalid assignment ID format' });
   }
    res.status(500).json({ message: 'Server error while fetching assignment', error: error.message });
  }
};

// --- Update Assignment by ID ---
const updateAssignment = async (req, res) => {
  console.log(`Processing updateAssignment request for user: ${req.user?.userId}, assignmentId: ${req.params.assignmentId}`);
  try {
    const userId = req.user.userId;
    const { assignmentId } = req.params;
    const updateData = req.body; // Get updated fields from request body

    // Prevent changing the courseId or userId during an update if necessary
    // delete updateData.courseId;
    // delete updateData.userId;

    // Find the assignment and update it, ensuring it belongs to the user
    const updatedAssignment = await Assignment.findOneAndUpdate(
      { _id: assignmentId, userId: userId }, // Filter: find assignment by ID and ensure ownership
      updateData,                         // Data to update with
      { new: true, runValidators: true }  // Options: return updated doc, run schema validation
    );

    if (!updatedAssignment) {
      console.log(`Update failed: Assignment not found or access denied for assignmentId: ${assignmentId}, user: ${userId}`);
      return res.status(404).json({ message: 'Assignment not found or access denied' });
    }

    console.log(`Assignment updated successfully: ${assignmentId}`);
    res.status(200).json(updatedAssignment);

  } catch (error) {
    console.error(`Error updating assignment ${req.params.assignmentId}:`, error);
     if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
     if (error.name === 'CastError') { 
        return res.status(400).json({ message: 'Invalid assignment ID format' });
    }
    res.status(500).json({ message: 'Server error while updating assignment', error: error.message });
  }
};

// --- Delete Assignment by ID ---
const deleteAssignment = async (req, res) => {
   console.log(`Processing deleteAssignment request for user: ${req.user?.userId}, assignmentId: ${req.params.assignmentId}`);
   try {
    const userId = req.user.userId;
    const { assignmentId } = req.params;

    // Find the assignment and delete it, ensuring it belongs to the user
    const deletedAssignment = await Assignment.findOneAndDelete({ _id: assignmentId, userId: userId });

    if (!deletedAssignment) {
      console.log(`Delete failed: Assignment not found or access denied for assignmentId: ${assignmentId}, user: ${userId}`);
      return res.status(404).json({ message: 'Assignment not found or access denied' });
    }

    console.log(`Assignment deleted successfully: ${assignmentId}`);
    // Send success response (200 OK with message, or 204 No Content)
    res.status(200).json({ message: 'Assignment deleted successfully' }); 
    // Alternatively: res.status(204).send(); 

  } catch (error) {
    console.error(`Error deleting assignment ${req.params.assignmentId}:`, error);
    if (error.name === 'CastError') { 
        return res.status(400).json({ message: 'Invalid assignment ID format' });
    }
    res.status(500).json({ message: 'Server error while deleting assignment', error: error.message });
  }
};


// Export all controller functions
module.exports = {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
}; 