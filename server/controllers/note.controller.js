const Note = require('../models/Note.model.js');
const TaskInstance = require('../models/TaskInstance.model.js'); // Needed to verify task instance ownership

// --- Create Note ---
const createNote = async (req, res) => {
  console.log(`Processing createNote request for user: ${req.user?.userId}`);
  try {
    const { description, title, links, files, taskInstanceId } = req.body;
    const userId = req.user.userId;

    // Basic validation
    if (!description || !taskInstanceId) {
      return res.status(400).json({ message: 'Missing required fields: description, taskInstanceId' });
    }

    // Verify the user owns the referenced TaskInstance
    const taskInstance = await TaskInstance.findOne({ _id: taskInstanceId, userId: userId });
    if (!taskInstance) {
      console.log(`Create note failed: TaskInstance ${taskInstanceId} not found or not owned by user ${userId}`);
      return res.status(404).json({ message: 'TaskInstance not found or access denied' });
    }

    // Create new Note instance
    const newNote = new Note({
      description,
      title,
      links,
      files,
      taskInstanceId, // Link to the task instance
      userId,         // Link to the user
    });

    // Save note
    const savedNote = await newNote.save();
    console.log(`Note created successfully with _id: ${savedNote._id} for user: ${userId}, taskInstance: ${taskInstanceId}`);
    res.status(201).json(savedNote);

  } catch (error) {
    console.error('Error creating note:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ID format provided (taskInstanceId).' });
    }
    res.status(500).json({ message: 'Server error while creating note', error: error.message });
  }
};

// --- Get Notes (e.g., for a specific task instance) ---
const getNotes = async (req, res) => {
  console.log(`Processing getNotes request for user: ${req.user?.userId}`, req.query);
  try {
    const userId = req.user.userId;
    const { taskInstanceId } = req.query;

    // Validate taskInstanceId is provided
    if (!taskInstanceId) {
      return res.status(400).json({ message: 'taskInstanceId query parameter is required' });
    }

    // Find notes matching the taskInstanceId AND belonging to the logged-in user
    // Sorting by creation date might be useful
    const notes = await Note.find({ taskInstanceId: taskInstanceId, userId: userId }).sort({ createdAt: -1 }); // Sort newest first

    console.log(`Found ${notes.length} notes for task instance ${taskInstanceId}, user: ${userId}`);
    res.status(200).json(notes);

  } catch (error) {
    console.error('Error fetching notes:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid task instance ID format provided.' });
    }
    res.status(500).json({ message: 'Server error while fetching notes', error: error.message });
  }
};

// --- Get Single Note by ID ---
const getNoteById = async (req, res) => {
  console.log(`Processing getNoteById request for user: ${req.user?.userId}, noteId: ${req.params.noteId}`);
  try {
    const userId = req.user.userId;
    const { noteId } = req.params;

    const note = await Note.findOne({ _id: noteId, userId: userId });

    if (!note) {
      console.log(`Note not found or access denied for ID: ${noteId}, user: ${userId}`);
      return res.status(404).json({ message: 'Note not found or access denied' });
    }

    console.log(`Note found: ${noteId}`);
    res.status(200).json(note);

  } catch (error) {
    console.error(`Error fetching note ${req.params.noteId}:`, error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid note ID format' });
    }
    res.status(500).json({ message: 'Server error while fetching note', error: error.message });
  }
};

// --- Update Note by ID ---
const updateNote = async (req, res) => {
  console.log(`Processing updateNote request for user: ${req.user?.userId}, noteId: ${req.params.noteId}`);
  try {
    const userId = req.user.userId;
    const { noteId } = req.params;
    const updateData = req.body;

    // Prevent changing the taskInstanceId or userId
    delete updateData.taskInstanceId;
    delete updateData.userId;

    // Find and update the note, ensuring ownership
    const updatedNote = await Note.findOneAndUpdate(
      { _id: noteId, userId: userId }, // Filter
      updateData,                     // Updates
      { new: true, runValidators: true } // Options
    );

    if (!updatedNote) {
      console.log(`Update failed: Note not found or access denied for ID: ${noteId}, user: ${userId}`);
      return res.status(404).json({ message: 'Note not found or access denied' });
    }

    console.log(`Note updated successfully: ${noteId}`);
    res.status(200).json(updatedNote);

  } catch (error) {
    console.error(`Error updating note ${req.params.noteId}:`, error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    if (error.name === 'CastError') { 
      return res.status(400).json({ message: 'Invalid note ID format' });
    }
    res.status(500).json({ message: 'Server error while updating note', error: error.message });
  }
};

// --- Delete Note by ID ---
const deleteNote = async (req, res) => {
  console.log(`Processing deleteNote request for user: ${req.user?.userId}, noteId: ${req.params.noteId}`);
  try {
    const userId = req.user.userId;
    const { noteId } = req.params;

    // Find and delete the note, ensuring ownership
    const deletedNote = await Note.findOneAndDelete({ _id: noteId, userId: userId });

    if (!deletedNote) {
      console.log(`Delete failed: Note not found or access denied for ID: ${noteId}, user: ${userId}`);
      return res.status(404).json({ message: 'Note not found or access denied' });
    }

    console.log(`Note deleted successfully: ${noteId}`);
    res.status(200).json({ message: 'Note deleted successfully' }); // Or 204 No Content

  } catch (error) {
    console.error(`Error deleting note ${req.params.noteId}:`, error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid note ID format' });
    }
    res.status(500).json({ message: 'Server error while deleting note', error: error.message });
  }
};


// Export all controller functions
module.exports = {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
}; 