// server/server.js

// Load environment variables from .env file
require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); 

// Import route handlers
const authRoutes = require('./routes/auth.routes.js'); 
const semesterRoutes = require('./routes/semester.routes.js'); // *** ADDED THIS LINE ***
// const otherRoutes = require('./routes/other.routes.js'); 

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
  app.use('/api/semesters', semesterRoutes); // *** ADDED THIS LINE ***
  
  // Mount other routers here later
  // app.use('/api/posts', otherRoutes); 
  
  console.log("Routes initialized.");
}


// --- Start Server after Connecting to DB ---
connectDB_Mongoose().then(() => {
  
  setupRoutes(); // Initialize routes AFTER DB is connected

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API status endpoint: GET /api/status`);
    console.log(`API auth endpoints mounted under: /api/auth`); 
    console.log(`API semester endpoints mounted under: /api/semesters`); // *** ADDED THIS LINE ***
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
