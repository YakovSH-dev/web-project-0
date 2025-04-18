const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskInstanceSchema = new Schema(
  {
    date: {
      type: Date,
      required: [true, 'Instance date/time is required'],
    },
    description: { // Specific notes for this instance
      type: String,
      trim: true,
    },
    levelOfUnderstanding: { // User rating (e.g., 0-10)
      type: Number,
      min: 0,
      max: 10,
      // Optional: Add validation for integer if needed
    },
    isCompleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    // Reference to the TaskDefinition this instance belongs to
    taskDefinitionId: {
      type: Schema.Types.ObjectId,
      ref: 'TaskDefinition', // Links to the 'TaskDefinition' model
      required: true,
      index: true,
    },
    // Reference to the User who owns this task instance
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

// Create the TaskInstance model from the schema
// Mongoose will create/use a collection named 'taskinstances'
const TaskInstance = mongoose.model('TaskInstance', taskInstanceSchema);

module.exports = TaskInstance; 