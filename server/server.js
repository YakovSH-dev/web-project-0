// server/server.js

// Load environment variables from .env file
require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); 

// Import route handlers
const authRoutes = require('./routes/auth.routes.js'); 
const semesterRoutes = require('./routes/semester.routes.js'); 
const courseRoutes = require('./routes/course.routes.js');
// Import NEW route handlers
const assignmentRoutes = require('./routes/assignment.routes.js');
const taskDefinitionRoutes = require('./routes/taskDefinition.routes.js');
const taskInstanceRoutes = require('./routes/taskInstance.routes.js');
const noteRoutes = require('./routes/note.routes.js');
const viewRoutes = require('./routes/view.routes.js'); // Import view routes

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors()); 
app.use(express.json()); 

// --- MongoDB Connection Setup with Mongoose ---
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('Error: MONGODB_URI is not defined in the environment variables.');
  process.exit(1); 
}

async function connectDB_Mongoose() {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log("Successfully connected to MongoDB Atlas using Mongoose!");
  } catch (error) {
    console.error('Failed to connect to MongoDB Atlas using Mongoose:', error);
    process.exit(1); 
  }
}

// --- Routes ---

// Example Status Route 
app.get('/api/status', (req, res) => { 
  res.json({ 
      status: 'ok', 
      message: 'Server is running smoothly',
      dbConnectionState: mongoose.connection.readyState 
    }); 
});

// --- Mount Routers ---
// Function to setup routes 
function setupRoutes() {
  // Mount the authentication routes under '/api/auth'
  app.use('/api/auth', authRoutes); 

  // Mount the semester routes under '/api/semesters'
  app.use('/api/semesters', semesterRoutes); 
  
  // Mount the course routes under '/api/courses'
  app.use('/api/courses', courseRoutes);
  
  // Mount the NEW routes
  app.use('/api/assignments', assignmentRoutes);
  app.use('/api/taskdefinitions', taskDefinitionRoutes);
  app.use('/api/taskinstances', taskInstanceRoutes);
  app.use('/api/notes', noteRoutes);
  app.use('/api/views', viewRoutes); // Mount view routes
  
  console.log("Routes initialized.");
}


// --- Start Server after Connecting to DB ---
connectDB_Mongoose().then(() => {
  
  setupRoutes(); // Initialize routes AFTER DB is connected

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API status endpoint: GET /api/status`);
    console.log(`API auth endpoints mounted under: /api/auth`); 
    console.log(`API semester endpoints mounted under: /api/semesters`); 
    console.log(`API course endpoints mounted under: /api/courses`);
    // Add logs for NEW routes
    console.log(`API assignment endpoints mounted under: /api/assignments`);
    console.log(`API task definition endpoints mounted under: /api/taskdefinitions`);
    console.log(`API task instance endpoints mounted under: /api/taskinstances`);
    console.log(`API note endpoints mounted under: /api/notes`);
    console.log(`API view endpoints mounted under: /api/views`); // Log view routes
  });

}).catch(error => {
  console.error("Server failed to start due to DB connection issue.", error);
});
  
// Optional: Graceful shutdown for Mongoose
process.on('SIGINT', async () => {
  console.log('Server shutting down...');
  await mongoose.connection.close(); 
  console.log('MongoDB connection closed.');
  process.exit(0);
});
