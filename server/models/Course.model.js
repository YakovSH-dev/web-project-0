// server/models/Course.model.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Import related models needed for cascade delete
const TaskDefinition = require('./TaskDefinition.model.js'); 
// const Assignment = require('./Assignment.model.js'); // Uncomment if needed
const TaskInstance = require('./TaskInstance.model.js'); // Uncomment if needed

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

// Middleware for cascading delete - runs BEFORE a course document is deleted via deleteOne()
courseSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  console.log(`Cascade Deleting related data for course: ${this._id}`);
  try {
    // Find related Task Definitions
    const definitionsToDelete = await TaskDefinition.find({ courseId: this._id });
    console.log(`Found ${definitionsToDelete.length} Task Definitions to cascade delete.`);

    // Create an array of promises for deleting each definition (triggers their middleware)
    const deleteDefinitionPromises = definitionsToDelete.map(definition => {
        console.log(`Triggering deleteOne() for Task Definition: ${definition._id}`);
        // IMPORTANT: We must call deleteOne on the document instance
        return definition.deleteOne(); 
    });

    // Also delete TaskInstances directly linked to the course (if any - depends on schema)
    // If TaskInstances ONLY link via TaskDefinition, this might be redundant, but safer to include.
    const deleteTaskInstancesPromise = TaskInstance.deleteMany({ courseId: this._id });
    console.log(`Triggering direct deleteMany() for Task Instances linked to course: ${this._id}`);

    // Execute all deletion promises
    await Promise.all([
        ...deleteDefinitionPromises, // Array of promises from definition.deleteOne()
        deleteTaskInstancesPromise,
        // Assignment.deleteMany({ courseId: this._id }), // Uncomment if needed
        // Add other direct deletions here...
    ]);

    console.log(`Successfully cascade deleted related data for course: ${this._id}`);
    next(); // Continue with the course deletion
  } catch (error) {
    console.error(`Error during cascade delete for course ${this._id}:`, error);
    // Pass the error to stop the deletion process if cascade fails
    next(error); 
  }
});

// Create the Course model from the schema
// Mongoose will create/use a collection named 'courses'
const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
