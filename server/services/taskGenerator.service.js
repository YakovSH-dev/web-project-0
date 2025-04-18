const mongoose = require('mongoose');
const TaskDefinition = require('../models/TaskDefinition.model.js');
const TaskInstance = require('../models/TaskInstance.model.js');
const Course = require('../models/Course.model.js');
const Semester = require('../models/Semester.model.js');

/**
 * Generates TaskInstance documents for a given TaskDefinition over its semester period.
 * 
 * @param {string | mongoose.Types.ObjectId} taskDefinitionId The ID of the TaskDefinition.
 * @param {string | mongoose.Types.ObjectId} userId The ID of the user owning the definition.
 * @returns {Promise<void>} A promise that resolves when generation is complete or rejects on error.
 */
const generateInstancesForDefinition = async (taskDefinitionId, userId) => {
  console.log(`Starting instance generation for TaskDefinition: ${taskDefinitionId}, User: ${userId}`);
  try {
    // 1. Fetch the Task Definition
    const definition = await TaskDefinition.findOne({ _id: taskDefinitionId, userId: userId });
    if (!definition) {
      throw new Error(`TaskDefinition not found or access denied: ${taskDefinitionId}`);
    }

    // 2. Fetch associated Course
    const course = await Course.findOne({ _id: definition.courseId, userId: userId });
    if (!course) {
      throw new Error(`Associated Course not found or access denied: ${definition.courseId}`);
    }

    // 3. Fetch associated Semester
    const semester = await Semester.findOne({ _id: course.semesterId, userId: userId });
    if (!semester) {
      throw new Error(`Associated Semester not found or access denied: ${course.semesterId}`);
    }

    // 4. Determine Timeframe
    const semesterStart = new Date(semester.startDate);
    semesterStart.setHours(0, 0, 0, 0); // Ensure start of day
    
    const semesterEnd = new Date(semesterStart);
    semesterEnd.setDate(semesterStart.getDate() + (semester.numberOfWeeks * 7) - 1); // End of the last week
    semesterEnd.setHours(23, 59, 59, 999); // Ensure end of day

    console.log(`Semester range: ${semesterStart.toISOString()} to ${semesterEnd.toISOString()}`);

    // 5. Iterate and Generate Instance Data
    const instancesToCreate = [];
    const definitionDays = definition.daysOfWeek; // [1, 3] for Mon/Wed
    let currentDate = new Date(semesterStart);

    while (currentDate <= semesterEnd) {
      const currentDayOfWeek = currentDate.getDay(); // 0=Sun, 1=Mon, ... 6=Sat

      if (definitionDays.includes(currentDayOfWeek)) {
        // Match found, create instance data for this date
        let instanceDate = new Date(currentDate);
        
        // Try to set the time based on definition.startTime (HH:MM)
        if (definition.startTime && typeof definition.startTime === 'string') {
            const timeParts = definition.startTime.match(/^(\d{2}):(\d{2})$/);
            if (timeParts) {
                try {
                    instanceDate.setHours(parseInt(timeParts[1], 10), parseInt(timeParts[2], 10), 0, 0);
                } catch (timeError) {
                    console.warn(`Could not parse startTime ${definition.startTime} for ${taskDefinitionId}. Using default date time.`);
                }
            } else {
                 console.warn(`Invalid startTime format ${definition.startTime} for ${taskDefinitionId}. Using default date time.`);
            }
        }
        
        instancesToCreate.push({
          date: instanceDate,
          // description: // Optional: Add a default description?
          isCompleted: false,
          taskDefinitionId: definition._id,
          userId: userId,
          // levelOfUnderstanding: null // Optional: Default value
        });
      }

      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 6. Bulk Insert
    if (instancesToCreate.length > 0) {
      console.log(`Attempting to insert ${instancesToCreate.length} instances for TaskDefinition: ${taskDefinitionId}`);
      await TaskInstance.insertMany(instancesToCreate, { ordered: false }); // ordered:false allows partial success if some duplicates exist
      console.log(`Successfully inserted instances for TaskDefinition: ${taskDefinitionId}`);
    } else {
      console.log(`No instances to generate for TaskDefinition: ${taskDefinitionId} in the semester range.`);
    }

  } catch (error) {
    console.error(`Error generating instances for TaskDefinition ${taskDefinitionId}:`, error);
    // Re-throw the error so the calling controller knows generation failed
    throw error; 
  }
};

module.exports = {
  generateInstancesForDefinition,
}; 