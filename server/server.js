// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3001;

// --- MongoDB Connection Setup ---

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('Error: MONGODB_URI is not defined in the environment variables.');
  process.exit(1); 
}

const client = new MongoClient(mongoUri);

let db; 

async function connectDB() {
    try {
      await client.connect();
      await client.db("admin").command({ ping: 1 }); 
      console.log("Successfully connected to MongoDB Atlas!");
  
    } catch (error) {
      // Ensures that the client will close when you finish/error
      console.error('Failed to connect to MongoDB Atlas:', error);
      await client.close(); 
      process.exit(1); 
    }
  }


// --- Middleware ---

app.use(cors());


// --- Routes ---

app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running smoothly',
    // dbConnected: client.topology?.isConnected() // More advanced check
  }); 
});


// --- Start Server after Connecting to DB ---

connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      // Note: In production on Render, you might not see this log directly, 
      // but Render's dashboard will show the server status.
      // The logged URL might show the internal port, not the public URL.
      console.log(`API status endpoint potentially available at /api/status relative to the server base URL`);
    });
  }).catch(error => {
    // Catch any error from connectDB that wasn't handled internally (though process.exit should prevent this)
    console.error("Server failed to start due to DB connection issue.", error);
  });
  
  // Optional: Graceful shutdown - close DB connection when server stops
  process.on('SIGINT', async () => {
    console.log('Server shutting down...');
    await client.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  });