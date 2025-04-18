const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const aiContentSchema = new Schema(
  {
    type: {
      type: String,
      required: [true, 'AI content type is required'],
      enum: ['summary', 'quiz', 'flashcards', 'explanation', 'other'], // Example enum values
      trim: true,
    },
    content: {
      type: Schema.Types.Mixed, // Flexible type for various structures (text, object, array)
      required: [true, 'AI content cannot be empty'],
    },
    // Reference to the TaskInstance this AI content relates to
    taskInstanceId: {
      type: Schema.Types.ObjectId,
      ref: 'TaskInstance', // Links to the 'TaskInstance' model
      required: true,
      index: true,
    },
    // Reference to the User who owns/generated this content
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Links to the 'User' model
      required: true,
      index: true,
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    // Consider if only createdAt is needed for generated content
    timestamps: true, 
  }
);

// Create the AiContent model from the schema
// Mongoose will create/use a collection named 'aicontents'
const AiContent = mongoose.model('AiContent', aiContentSchema);

module.exports = AiContent; 