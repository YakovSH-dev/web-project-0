const TaskDefinition = require('../models/TaskDefinition.model.js');
const Course = require('../models/Course.model.js'); // Needed to verify course ownership
const TaskInstance = require('../models/TaskInstance.model.js'); // Needed for cascade delete
// Import the generator service
const { generateInstancesForDefinition } = require('../services/taskGenerator.service.js');

// --- Create TaskDefinition ---
const createTaskDefinition = async (req, res) => {
  console.log(`Processing createTaskDefinition request for user: ${req.user?.userId}`);
  let savedTaskDefinition;
  try {
    // Destructure schedule instead of daysOfWeek/startTime
    const { type, instructor, schedule, length, courseId, description } = req.body; // Added description here too
    const userId = req.user.userId;

    // Basic validation for presence of required fields including schedule
    if (!type || !schedule || !Array.isArray(schedule) || schedule.length === 0 || !courseId) {
      // Improved error message
      return res.status(400).json({ message: 'Missing or invalid required fields: type, schedule (non-empty array with dayOfWeek and startTime), courseId' });
    }

    // Verify the user owns the course
    const course = await Course.findOne({ _id: courseId, userId: userId });
    if (!course) {
      console.log(`Create task definition failed: Course ${courseId} not found or not owned by user ${userId}`);
      return res.status(404).json({ message: 'Course not found or access denied' });
    }

    // Create new TaskDefinition instance with schedule
    const newTaskDefinition = new TaskDefinition({
      type,
      instructor,
      schedule, // Use the schedule array
      length,
      description, // Add description if provided
      courseId,
      userId,
    });

    // Save the task definition (Mongoose validation handles schedule format)
    savedTaskDefinition = await newTaskDefinition.save();
    console.log(`TaskDefinition created successfully with _id: ${savedTaskDefinition._id} for user: ${userId}, course: ${courseId}`);

    // ** Generate Instances After Successful Save **
    // This service will need updating too
    try {
        await generateInstancesForDefinition(savedTaskDefinition._id, userId);
    } catch (generationError) {
        console.error(`Failed to generate instances for new TaskDefinition ${savedTaskDefinition._id}:`, generationError);
        // Log error but don't fail request
    }

    res.status(201).json(savedTaskDefinition);

  } catch (error) {
    console.error('Error creating task definition:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ID format provided.' });
    }
    res.status(500).json({ message: 'Server error while creating task definition', error: error.message });
  }
};

// --- Get TaskDefinitions (e.g., for a specific course) ---
const getTaskDefinitions = async (req, res) => {
  console.log(`Processing getTaskDefinitions request for user: ${req.user?.userId}`);
  try {
    const userId = req.user.userId;
    const { courseId } = req.query; // Get courseId from query parameter

    // Validate courseId is provided
    if (!courseId) {
      return res.status(400).json({ message: 'courseId query parameter is required' });
    }

    // Find task definitions matching the courseId AND belonging to the logged-in user
    // Sorting logic needs review: .sort({ type: 1, startTime: 1 })
    // Maybe sort by type, then first schedule entry's day/time?
    // For now, just sort by type:
    const taskDefinitions = await TaskDefinition.find({ courseId: courseId, userId: userId }).sort({ type: 1 });

    console.log(`Found ${taskDefinitions.length} task definitions for course ${courseId}, user: ${userId}`);
    res.status(200).json(taskDefinitions);

  } catch (error) {
    console.error('Error fetching task definitions:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid course ID format provided.' });
    }
    res.status(500).json({ message: 'Server error while fetching task definitions', error: error.message });
  }
};

// --- Get Single TaskDefinition by ID ---
const getTaskDefinitionById = async (req, res) => {
  console.log(`Processing getTaskDefinitionById request for user: ${req.user?.userId}, taskDefinitionId: ${req.params.taskDefinitionId}`);
  try {
    const userId = req.user.userId;
    const { taskDefinitionId } = req.params; // Get ID from URL parameter

    const taskDefinition = await TaskDefinition.findOne({ _id: taskDefinitionId, userId: userId });

    if (!taskDefinition) {
      console.log(`TaskDefinition not found or access denied for ID: ${taskDefinitionId}, user: ${userId}`);
      return res.status(404).json({ message: 'TaskDefinition not found or access denied' });
    }

    console.log(`TaskDefinition found: ${taskDefinitionId}`);
    res.status(200).json(taskDefinition);

  } catch (error) {
    console.error(`Error fetching task definition ${req.params.taskDefinitionId}:`, error);
    if (error.name === 'CastError') { // Handle invalid ObjectId format
      return res.status(400).json({ message: 'Invalid task definition ID format' });
    }
    res.status(500).json({ message: 'Server error while fetching task definition', error: error.message });
  }
};

// --- Update TaskDefinition by ID ---
const updateTaskDefinition = async (req, res) => {
  console.log(`Processing updateTaskDefinition request for user: ${req.user?.userId}, taskDefinitionId: ${req.params.taskDefinitionId}`);
  let updatedTaskDefinition;
  try {
    const userId = req.user.userId;
    const { taskDefinitionId } = req.params;
    const updateData = req.body; // Contains potentially updated schedule

    // Ensure we don't accidentally delete schedule if it's not provided in an update
    // However, if an empty schedule array is explicitly provided, it should fail validation
    // based on the model's required validator.

    // Prevent changing the courseId or userId
    delete updateData.courseId;
    delete updateData.userId;

    // Find and update, runValidators will check the new schedule format
    updatedTaskDefinition = await TaskDefinition.findOneAndUpdate(
      { _id: taskDefinitionId, userId: userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedTaskDefinition) {
      console.log(`Update failed: TaskDefinition not found or access denied for ID: ${taskDefinitionId}, user: ${userId}`);
      return res.status(404).json({ message: 'TaskDefinition not found or access denied' });
    }

    console.log(`TaskDefinition updated successfully: ${taskDefinitionId}`);

    // ** Delete Future Instances and Regenerate After Successful Update **
    // This service needs updating
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        
        console.log(`Deleting future instances for TaskDefinition ${taskDefinitionId} from ${today.toISOString()}`);
        const deleteResult = await TaskInstance.deleteMany({
            taskDefinitionId: updatedTaskDefinition._id,
            userId: userId,
            date: { $gte: today } // Delete instances from today onwards
        });
        console.log(`Deleted ${deleteResult.deletedCount} future instances.`);

        // Regenerate instances based on the updated definition
        await generateInstancesForDefinition(updatedTaskDefinition._id, userId);

    } catch (regenerationError) {
        console.error(`Error during instance regeneration for updated TaskDefinition ${updatedTaskDefinition._id}:`, regenerationError);
        // Log the error, but the main update was successful.
    }

    res.status(200).json(updatedTaskDefinition);

  } catch (error) {
    console.error(`Error updating task definition ${req.params.taskDefinitionId}:`, error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    if (error.name === 'CastError') { 
      return res.status(400).json({ message: 'Invalid task definition ID format' });
    }
    res.status(500).json({ message: 'Server error while updating task definition', error: error.message });
  }
};

// --- Delete TaskDefinition by ID (using middleware) ---
const deleteTaskDefinition = async (req, res) => {
  console.log(`Processing deleteTaskDefinition request for user: ${req.user?.userId}, taskDefinitionId: ${req.params.taskDefinitionId}`);
  try {
    const userId = req.user.userId;
    const { taskDefinitionId } = req.params;

    // Step 1: Find the task definition document ensuring ownership
    const definitionToDelete = await TaskDefinition.findOne({ _id: taskDefinitionId, userId: userId });

    if (!definitionToDelete) {
      console.log(`Delete failed: TaskDefinition not found or access denied for ID: ${taskDefinitionId}, user: ${userId}`);
      return res.status(404).json({ message: 'TaskDefinition not found or access denied' });
    }

    // Step 2: Call deleteOne() ON THE DOCUMENT to trigger middleware
    await definitionToDelete.deleteOne();

    console.log(`TaskDefinition deleted successfully (and middleware triggered): ${taskDefinitionId}`);
    res.status(200).json({ message: 'TaskDefinition deleted successfully' });

  } catch (error) {
    console.error(`Error deleting task definition ${req.params.taskDefinitionId}:`, error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid task definition ID format' });
    }
    // Handle potential errors from the 'pre remove' middleware as well
    res.status(500).json({ message: 'Server error while deleting task definition', error: error.message });
  }
};


// Export all controller functions
module.exports = {
  createTaskDefinition,
  getTaskDefinitions,
  getTaskDefinitionById,
  updateTaskDefinition,
  deleteTaskDefinition,
}; 