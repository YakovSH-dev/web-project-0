// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---

app.use(cors());
app.use(express.json());


// --- MongoDB Connection Setup ---

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('Error: MONGODB_URI is not defined in the environment variables.');
  process.exit(1); 
}
const client = new MongoClient(mongoUri);
const dbName = "buttonAppDb"; 
const clicksCollectionName = "clicks"; 
const usersCollectionName = "users"; 

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

// --- Routes ---

app.get('/api/status', (req, res) => { // for getting server status

  res.json({ 
    status: 'ok', 
    message: 'Server is running smoothly',
    // dbConnected: client.topology?.isConnected() // More advanced check
  }); 
});

app.post('/api/clicks', async (req, res) => { // POST route to record a click event
    // This route doesn't expect specific data in the request body for now,
    // but express.json() middleware allows it for future expansion.
    console.log(`Received request for POST /api/clicks at ${new Date().toISOString()}`); 
    
    try {
      // Select the database and collection
      const database = client.db(dbName); 
      const collection = database.collection(clicksCollectionName);
  
      // Create a document to insert (just a timestamp for now)
      const clickDocument = {
        timestamp: new Date(),
        // Example: you could potentially add data from req.body if needed
        // requestData: req.body 
      };
  
      // Insert the document into the collection
      const result = await collection.insertOne(clickDocument);
      console.log(`Inserted click document with _id: ${result.insertedId}`);
  
      // Send a success response (201 Created)
      res.status(201).json({ message: 'Click recorded successfully', insertedId: result.insertedId }); 
  
    } catch (error) {
      console.error('Failed to insert click document:', error);
      // Send an error response (500 Internal Server Error)
      res.status(500).json({ message: 'Failed to record click', error: error.message });
    }
  });

app.post('/api/userSubmit', async (req, res) => { // POST route to record a user submition event

  console.log(`Received request for POST /api/UserSubmit at ${new Date().toISOString()}`); 
  
  try {

    const database = client.db(dbName); 
    const collection = database.collection(usersCollectionName);

    const userDataDocument = {
      name: res.body.name,
      age: res.body.age,
      timestamp: new Date(), 
    };

    // Insert the document into the collection
    const result = await collection.insertOne(userDataDocument);
    console.log(`Inserted click document with _id: ${result.insertedId}`);

    // Send a success response (201 Created)
    res.status(201).json({ message: 'Click recorded successfully', insertedId: result.insertedId }); 

  } catch (error) {
    console.error('Failed to insert click document:', error);
    // Send an error response (500 Internal Server Error)
    res.status(500).json({ message: 'Failed to record click', error: error.message });
  }
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