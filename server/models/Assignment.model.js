const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assignmentSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    links: [{ // Array of link objects
      title: { type: String, trim: true },
      url: { type: String, trim: true, required: true }
    }],
    files: [{ // Array of file objects
      name: { type: String, trim: true },
      url: { type: String, trim: true } // URL or reference to stored file
    }],
    isCompleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    // Reference to the Course this assignment belongs to
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course', // Links to the 'Course' model
      required: true,
      index: true, // Index for faster querying by course
    },
    // Reference to the User who owns this assignment
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Links to the 'User' model
      required: true,
      index: true, // Index for faster querying by user
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Create the Assignment model from the schema
// Mongoose will create/use a collection named 'assignments'
const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment; 