const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const noteSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Note description is required'],
      trim: true,
    },
    links: [{ // Array of link objects
      title: { type: String, trim: true },
      url: { type: String, trim: true, required: true }
    }],
    files: [{ // Array of file objects
      name: { type: String, trim: true },
      url: { type: String, trim: true } // URL or reference to stored file
    }],
    // Reference to the TaskInstance this note is associated with
    taskInstanceId: {
      type: Schema.Types.ObjectId,
      ref: 'TaskInstance', // Links to the 'TaskInstance' model
      required: true,
      index: true,
    },
    // Reference to the User who owns this note
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

// Create the Note model from the schema
// Mongoose will create/use a collection named 'notes'
const Note = mongoose.model('Note', noteSchema);

module.exports = Note; 