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
    // 1. Fetch the Task Definition (with schedule)
    const definition = await TaskDefinition.findOne({ _id: taskDefinitionId, userId: userId });
    if (!definition) {
      throw new Error(`TaskDefinition not found or access denied: ${taskDefinitionId}`);
    }
    // Add check for schedule existence, although model requires it
    if (!definition.schedule || definition.schedule.length === 0) {
        console.warn(`TaskDefinition ${taskDefinitionId} has no schedule entries. Skipping generation.`);
        return; // Nothing to generate
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
    semesterStart.setHours(0, 0, 0, 0);
    const semesterEnd = new Date(semesterStart);
    semesterEnd.setDate(semesterStart.getDate() + (semester.numberOfWeeks * 7) - 1);
    semesterEnd.setHours(23, 59, 59, 999);

    console.log(`Semester range: ${semesterStart.toISOString()} to ${semesterEnd.toISOString()}`);

    // 5. Iterate and Generate Instance Data (using definition.schedule)
    const instancesToCreate = [];
    let currentDate = new Date(semesterStart);

    while (currentDate <= semesterEnd) {
      const currentDayOfWeek = currentDate.getDay(); // 0=Sun, 1=Mon, ... 6=Sat

      // Iterate through each schedule entry for the definition
      for (const scheduleEntry of definition.schedule) {
        // Check if the current day matches a day in the schedule
        if (scheduleEntry.dayOfWeek === currentDayOfWeek) {
          // Match found, create instance data for this date and time
          let instanceDate = new Date(currentDate);

          // Set the time based on scheduleEntry.startTime (HH:MM)
          const timeParts = scheduleEntry.startTime.match(/^(\d{2}):(\d{2})$/);
          if (timeParts) {
            try {
              instanceDate.setHours(parseInt(timeParts[1], 10), parseInt(timeParts[2], 10), 0, 0);
            } catch (timeError) {
              console.warn(`Could not parse startTime ${scheduleEntry.startTime} for entry in ${taskDefinitionId}. Using date only.`);
            }
          } else {
            console.warn(`Invalid startTime format ${scheduleEntry.startTime} for entry in ${taskDefinitionId}. Using date only.`);
          }

          instancesToCreate.push({
            date: instanceDate,
            isCompleted: false,
            taskDefinitionId: definition._id,
            userId: userId,
          });
        }
      }

      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 6. Bulk Insert
    if (instancesToCreate.length > 0) {
      console.log(`Attempting to insert ${instancesToCreate.length} instances for TaskDefinition: ${taskDefinitionId}`);
      // Consider adding a check/cleanup for existing future instances before inserting?
      // For now, insertMany handles potential duplicate key errors if a date+definition already exists.
      await TaskInstance.insertMany(instancesToCreate, { ordered: false }); 
      console.log(`Successfully generated/inserted instances for TaskDefinition: ${taskDefinitionId}`);
    } else {
      console.log(`No instances to generate for TaskDefinition: ${taskDefinitionId} based on schedule and semester range.`);
    }

  } catch (error) {
    console.error(`Error generating instances for TaskDefinition ${taskDefinitionId}:`, error);
    throw error; 
  }
};

module.exports = {
  generateInstancesForDefinition,
}; 