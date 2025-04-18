const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskDefinitionSchema = new Schema(
  {
    type: {
      type: String,
      required: [true, 'Task type is required'],
      enum: ['Lecture', 'Lab', 'Tutorial', 'Seminar', 'Workshop', 'Other'], // Example enum values
      trim: true,
    },
    instructor: {
      type: String,
      trim: true,
    },
    daysOfWeek: {
      type: [Number], // Array of numbers (0=Sun, 1=Mon, ..., 6=Sat)
      required: [true, 'Days of week are required'],
      validate: {
        validator: function(v) {
          // Ensure all values are integers between 0 and 6
          return Array.isArray(v) && v.length > 0 && v.every(day => Number.isInteger(day) && day >= 0 && day <= 6);
        },
        message: props => `${props.value} is not a valid array of days (0-6)`
      },
    },
    length: { // Duration in minutes
      type: Number,
      min: [0, 'Length cannot be negative']
    },
    startTime: { // e.g., "09:00"
      type: String,
      trim: true,
      // Optional: Add validation for time format (HH:MM)
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:MM format']
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

// Create the TaskDefinition model from the schema
// Mongoose will create/use a collection named 'taskdefinitions'
const TaskDefinition = mongoose.model('TaskDefinition', taskDefinitionSchema);

module.exports = TaskDefinition; 