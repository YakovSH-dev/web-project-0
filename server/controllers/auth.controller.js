// server/controllers/auth.controller.js

// Import the User model
const User = require('../models/User.model.js'); 

// Controller function for handling user signup
const signup = async (req, res) => {
  console.log(`Processing signup request for email: ${req.body.email}`);

  try {
    // Extract email, password, and name from the request body
    // Assuming you added 'name' to your frontend form and User model schema
    const { email, password, name } = req.body; 

    // Basic input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    // Add validation for name if you require it
    // if (!name) {
    //   return res.status(400).json({ message: 'Name is required' });
    // }

    // Check if user already exists using the Mongoose User model
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      console.log(`Signup attempt failed: Email already exists - ${email}`);
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Create a new user instance using the User model
    // Pass the plain password - the pre-save hook in User.model.js will hash it
    const newUser = new User({ 
      email, 
      password, // Pass plain password here
      name 
    });

    // Save the new user instance to the database
    // This triggers the 'pre-save' hook for hashing
    const savedUser = await newUser.save();
    console.log(`New user created successfully for email: ${email} with _id: ${savedUser._id}`);

    // Send success response (201 Created)
    // Important: Do NOT send the password hash (or user object) back in the response
    res.status(201).json({ message: 'User created successfully', userId: savedUser._id });

  } catch (error) {
    // Handle potential errors (e.g., database errors, validation errors from schema)
    console.error('Error during user signup:', error);
    // Check for Mongoose validation errors specifically (optional)
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ message: 'Server error during signup', error: error.message });
  }
};

// --- Add other controller functions (like login) here later ---
// const login = async (req, res) => { ... };

// Export the controller functions
module.exports = {
  signup,
  // login, 
};
