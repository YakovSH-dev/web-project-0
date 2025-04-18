const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Import related model for cascade delete
const TaskInstance = require('./TaskInstance.model.js');

const scheduleEntrySchema = new Schema({
  dayOfWeek: { // 0=Sun, 1=Mon, ..., 6=Sat
    type: Number,
    required: [true, 'Day of week is required for schedule entry'],
    min: [0, 'Day of week must be between 0 and 6'],
    max: [6, 'Day of week must be between 0 and 6']
  },
  startTime: { // e.g., "09:00"
    type: String,
    required: [true, 'Start time is required for schedule entry'],
    trim: true,
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:MM format']
  }
}, { _id: false }); // No separate _id for schedule entries

const taskDefinitionSchema = new Schema(
  {
    type: {
      type: String,
      required: [true, 'Task type is required'],
      enum: ['Lecture', 'Lab', 'Tutorial', 'Seminar', 'Workshop', 'Reading', 'Exam', 'Other'], // Updated enum
      trim: true,
    },
    instructor: {
      type: String,
      trim: true,
    },
    description: { type: String, trim: true }, // ADDED DESCRIPTION FIELD based on TaskCard usage
    schedule: {
      type: [scheduleEntrySchema], // Array of schedule entries
      required: [true, 'At least one schedule entry (day and time) is required'],
      validate: {
        validator: function(v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Schedule cannot be empty.'
      }
    },
    length: { // Duration in minutes
      type: Number,
      min: [0, 'Length cannot be negative'],
      // Consider making length required if applicable
      // required: [true, 'Task length/duration is required']
    },
    // Reference to the Course this task belongs to
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course', // Links to the 'Course' model
      required: true,
      index: true,
    },
    // Reference to the User who owns this task definition
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Links to the 'User' model
      required: true,
      index: true,
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Middleware for cascading delete - runs BEFORE a task definition is deleted via deleteOne()
taskDefinitionSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  console.log(`Cascade Deleting related TaskInstances for TaskDefinition: ${this._id}`);
  try {
    await TaskInstance.deleteMany({ taskDefinitionId: this._id });
    console.log(`Successfully removed TaskInstances for TaskDefinition: ${this._id}`);
    next(); // Continue with the TaskDefinition deletion
  } catch (error) {
    console.error(`Error during cascade delete for TaskDefinition ${this._id}:`, error);
    // Pass the error to stop the deletion process if cascade fails
    next(error); 
  }
});

// Create the TaskDefinition model from the schema
// Mongoose will create/use a collection named 'taskdefinitions'
const TaskDefinition = mongoose.model('TaskDefinition', taskDefinitionSchema);

module.exports = TaskDefinition; 