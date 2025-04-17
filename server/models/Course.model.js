// server/models/Course.model.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },
    color: { // For personalization in the UI
      type: String,
      trim: true,
      default: '#cccccc', // Default color
    },
    instructor: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    links: [{ // Array of link objects
        title: { type: String, trim: true },
        url: { type: String, trim: true, required: true }
    }],
    // Reference to the Semester this course belongs to
    semesterId: {
      type: Schema.Types.ObjectId,
      ref: 'Semester', // Links to the 'Semester' model
      required: true,
      index: true, // Index for faster querying by semester
    },
    // Reference to the User who owns this course (and the semester)
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Links to the 'User' model
      required: true,
      index: true, // Index for faster querying by user
    },
    // Add other course-specific fields as needed
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Create the Course model from the schema
// Mongoose will create/use a collection named 'courses'
const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
