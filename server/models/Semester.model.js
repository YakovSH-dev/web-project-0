// server/models/Semester.model.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema; // Destructure Schema for cleaner use

// Define the schema for the Semester model
const semesterSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Semester name is required'], // e.g., "Fall 2025"
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    numberOfWeeks: {
      type: Number,
      required: [true, 'Number of weeks is required'],
      min: [1, 'Semester must be at least 1 week long'], // Basic validation
    },
    // Reference to the User who owns this semester
    userId: {
      type: Schema.Types.ObjectId, // Data type for MongoDB ObjectIds
      ref: 'User', // Creates a reference to the 'User' model
      required: true, // A semester must belong to a user
      index: true, // Add an index for faster querying of semesters by user
    },
    // You can add more fields later, e.g., status ('active', 'completed', 'planned')
    // status: { type: String, enum: ['planned', 'active', 'completed'], default: 'planned' }
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true, 
  }
);

// Create the Semester model from the schema
// Mongoose will create/use a collection named 'semesters' (pluralized)
const Semester = mongoose.model('Semester', semesterSchema);

// Export the model
module.exports = Semester;
