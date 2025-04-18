const TaskInstance = require('../models/TaskInstance.model.js');
const TaskDefinition = require('../models/TaskDefinition.model.js'); // Needed to verify task definition ownership
const Note = require('../models/Note.model.js'); // Needed for cascade delete
const AiContent = require('../models/AiContent.model.js'); // Needed for cascade delete

// --- Create TaskInstance ---
// Note: Creating individual instances might be less common than generating them based on definitions.
// This controller might focus more on GET/UPDATE/DELETE.
const createTaskInstance = async (req, res) => {
  console.log(`Processing createTaskInstance request for user: ${req.user?.userId}`);
  try {
    const { date, description, levelOfUnderstanding, isCompleted, taskDefinitionId } = req.body;
    const userId = req.user.userId;

    // Basic validation
    if (!date || !taskDefinitionId) {
      return res.status(400).json({ message: 'Missing required fields: date, taskDefinitionId' });
    }

    // Validate date format (simple check, more robust validation can be added)
    const instanceDate = new Date(date);
    if (isNaN(instanceDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
    }

    // Verify the user owns the referenced TaskDefinition
    const taskDefinition = await TaskDefinition.findOne({ _id: taskDefinitionId, userId: userId });
    if (!taskDefinition) {
      console.log(`Create task instance failed: TaskDefinition ${taskDefinitionId} not found or not owned by user ${userId}`);
      return res.status(404).json({ message: 'TaskDefinition not found or access denied' });
    }

    // Create new TaskInstance
    const newTaskInstance = new TaskInstance({
      date: instanceDate,
      description,
      levelOfUnderstanding,
      isCompleted, // Defaults to false in schema if not provided
      taskDefinitionId, // Link to the definition
      userId,           // Link to the user
    });

    // Save instance
    const savedTaskInstance = await newTaskInstance.save();
    console.log(`TaskInstance created successfully with _id: ${savedTaskInstance._id} for user: ${userId}, definition: ${taskDefinitionId}`);
    res.status(201).json(savedTaskInstance);

  } catch (error) {
    console.error('Error creating task instance:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ID format provided (taskDefinitionId).' });
    }
    res.status(500).json({ message: 'Server error while creating task instance', error: error.message });
  }
};

// --- Get TaskInstances (e.g., for a specific task definition, or date range) ---
const getTaskInstances = async (req, res) => {
  console.log(`Processing getTaskInstances request for user: ${req.user?.userId}`, req.query);
  try {
    const userId = req.user.userId;
    const { taskDefinitionId, startDate, endDate } = req.query;

    let query = { userId: userId }; // Base query always includes the user

    // Add taskDefinitionId filter if provided
    if (taskDefinitionId) {
      // Optional: Validate taskDefinitionId format here if needed, though CastError below handles it
      query.taskDefinitionId = taskDefinitionId;
    }

    // Add date range filter if provided
    const dateFilter = {};
    if (startDate) {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        return res.status(400).json({ message: 'Invalid startDate format' });
      }
      // Set to start of the day (local time) for inclusive range
      start.setHours(0, 0, 0, 0);
      dateFilter.$gte = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) {
        return res.status(400).json({ message: 'Invalid endDate format' });
      }
      // Set to end of the day (local time) for inclusive range
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }

    // Add date filter to the main query if it has keys
    if (Object.keys(dateFilter).length > 0) {
      query.date = dateFilter;
    }

    console.log("Executing TaskInstance find with query:", query);

    // Find task instances matching the query, sort by date
    const taskInstances = await TaskInstance.find(query).sort({ date: 1 }); // Sort by date ascending

    console.log(`Found ${taskInstances.length} task instances for user ${userId} with filters`, req.query);
    res.status(200).json(taskInstances);

  } catch (error) {
    console.error('Error fetching task instances:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ID format provided (e.g., taskDefinitionId).' });
    }
    res.status(500).json({ message: 'Server error while fetching task instances', error: error.message });
  }
};

// --- Get Single TaskInstance by ID ---
const getTaskInstanceById = async (req, res) => {
  console.log(`Processing getTaskInstanceById request for user: ${req.user?.userId}, taskInstanceId: ${req.params.taskInstanceId}`);
  try {
    const userId = req.user.userId;
    const { taskInstanceId } = req.params;

    const taskInstance = await TaskInstance.findOne({ _id: taskInstanceId, userId: userId });

    if (!taskInstance) {
      console.log(`TaskInstance not found or access denied for ID: ${taskInstanceId}, user: ${userId}`);
      return res.status(404).json({ message: 'TaskInstance not found or access denied' });
    }

    console.log(`TaskInstance found: ${taskInstanceId}`);
    res.status(200).json(taskInstance);

  } catch (error) {
    console.error(`Error fetching task instance ${req.params.taskInstanceId}:`, error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid task instance ID format' });
    }
    res.status(500).json({ message: 'Server error while fetching task instance', error: error.message });
  }
};

// --- Update TaskInstance by ID (e.g., mark as complete, add description, LOU) ---
const updateTaskInstance = async (req, res) => {
  console.log(`Processing updateTaskInstance request for user: ${req.user?.userId}, taskInstanceId: ${req.params.taskInstanceId}`);
  try {
    const userId = req.user.userId;
    const { taskInstanceId } = req.params;
    const updateData = req.body;

    // **Important:** Explicitly define allowed fields to prevent unwanted updates
    const allowedUpdates = {};
    if (updateData.hasOwnProperty('isCompleted')) {
        allowedUpdates.isCompleted = updateData.isCompleted;
    }
    if (updateData.hasOwnProperty('description')) {
        allowedUpdates.description = updateData.description;
    }
    if (updateData.hasOwnProperty('levelOfUnderstanding')) {
         // Add validation for LOU range if needed here or rely on schema
        allowedUpdates.levelOfUnderstanding = updateData.levelOfUnderstanding;
    }

    // Check if any valid fields were provided for update
    if (Object.keys(allowedUpdates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided for update' });
    }

    // Find the instance and update it, ensuring ownership
    const updatedTaskInstance = await TaskInstance.findOneAndUpdate(
      { _id: taskInstanceId, userId: userId }, // Filter
      { $set: allowedUpdates }, // Use $set with only allowed fields
      { new: true, runValidators: true }  // Options: return updated, run schema validation
    );

    if (!updatedTaskInstance) {
      console.log(`Update failed: TaskInstance not found or access denied for ID: ${taskInstanceId}, user: ${userId}`);
      return res.status(404).json({ message: 'TaskInstance not found or access denied' });
    }

    console.log(`TaskInstance updated successfully: ${taskInstanceId}`);
    res.status(200).json(updatedTaskInstance);

  } catch (error) {
    console.error(`Error updating task instance ${req.params.taskInstanceId}:`, error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    if (error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid task instance ID format' });
    }
    res.status(500).json({ message: 'Server error while updating task instance', error: error.message });
  }
};

// --- Delete TaskInstance by ID ---
// Note: Deleting instances might be less common than generating/updating them.
const deleteTaskInstance = async (req, res) => {
  console.log(`Processing deleteTaskInstance request for user: ${req.user?.userId}, taskInstanceId: ${req.params.taskInstanceId}`);
  try {
    const userId = req.user.userId;
    const { taskInstanceId } = req.params;

    // Find and delete the task instance, ensuring ownership
    const deletedTaskInstance = await TaskInstance.findOneAndDelete({ _id: taskInstanceId, userId: userId });

    if (!deletedTaskInstance) {
      console.log(`Delete failed: TaskInstance not found or access denied for ID: ${taskInstanceId}, user: ${userId}`);
      return res.status(404).json({ message: 'TaskInstance not found or access denied' });
    }

    // ** Cascade Delete Logic (Optional) **
    // Delete related Notes and AiContent
    try {
      const noteDeleteResult = await Note.deleteMany({ taskInstanceId: taskInstanceId, userId: userId });
      console.log(`Cascade delete: Deleted ${noteDeleteResult.deletedCount} Notes for TaskInstance ${taskInstanceId}`);
      const aiDeleteResult = await AiContent.deleteMany({ taskInstanceId: taskInstanceId, userId: userId });
      console.log(`Cascade delete: Deleted ${aiDeleteResult.deletedCount} AiContent for TaskInstance ${taskInstanceId}`);
    } catch (cascadeError) {
      console.error(`Error during cascade delete for TaskInstance ${taskInstanceId}:`, cascadeError);
      // Log error but proceed as the instance itself was deleted.
    }

    console.log(`TaskInstance deleted successfully: ${taskInstanceId}`);
    res.status(200).json({ message: 'TaskInstance (and related data) deleted successfully' });

  } catch (error) {
    console.error(`Error deleting task instance ${req.params.taskInstanceId}:`, error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid task instance ID format' });
    }
    res.status(500).json({ message: 'Server error while deleting task instance', error: error.message });
  }
};

// --- Generate Task Instances based on Definitions ---
// TODO: Add a function here (or perhaps in a separate service/utility) 
// to generate TaskInstances for a given TaskDefinition over a specific period (e.g., a semester duration).
// This would likely be called when a TaskDefinition is created/updated or when a Semester starts.


// Export all controller functions
module.exports = {
  createTaskInstance,
  getTaskInstances,
  getTaskInstanceById,
  updateTaskInstance,
  deleteTaskInstance,
  // Potentially add a function for generation if handled here
}; 