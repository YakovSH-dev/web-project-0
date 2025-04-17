// server/controllers/auth.controller.js

const User = require('../models/User.model.js'); 
const bcrypt = require('bcrypt'); // Need bcrypt for comparing passwords
const jwt = require('jsonwebtoken'); // Need jsonwebtoken for creating tokens

// Get JWT secret from environment variables
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
  process.exit(1);
}

// Controller function for handling user signup
const signup = async (req, res) => {
  console.log(`Processing signup request for email: ${req.body.email}`);
  try {
    const { email, password, name } = req.body; 
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      console.log(`Signup attempt failed: Email already exists - ${email}`);
      return res.status(400).json({ message: 'Email already in use' });
    }
    // Password hashing is handled by the pre-save hook in User.model.js
    const newUser = new User({ email, password, name });
    const savedUser = await newUser.save();
    console.log(`New user created successfully for email: ${email} with _id: ${savedUser._id}`);
    res.status(201).json({ message: 'User created successfully', userId: savedUser._id });
  } catch (error) {
    console.error('Error during user signup:', error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ message: 'Server error during signup', error: error.message });
  }
};

// Controller function for handling user login
const login = async (req, res) => {
  console.log(`Processing login request for email: ${req.body.email}`);
  try {
    const { email, password } = req.body;

    // Basic input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email using the Mongoose User model
    const user = await User.findOne({ email: email });
    if (!user) {
      console.log(`Login attempt failed: User not found - ${email}`);
      // Use 401 Unauthorized for security (don't reveal if email exists)
      return res.status(401).json({ message: 'Invalid credentials' }); 
    }

    // Compare the provided password with the stored hash using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Login attempt failed: Invalid password for user - ${email}`);
      // Use 401 Unauthorized
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // --- If password matches, generate JWT ---
    console.log(`Login successful for user: ${email}`);

    // Create payload for the token (include non-sensitive user info)
    const payload = {
      userId: user._id,
      email: user.email
      // Add other info like roles if needed, but keep payload small
    };

    // Sign the token
    const token = jwt.sign(
      payload,        // Data to include in the token
      jwtSecret,      // Secret key for signing
      { expiresIn: '1h' } // Token expiration time (e.g., 1 hour)
    );

    // Send the token back to the client
    res.status(200).json({ message: 'Login successful', token: token });

  } catch (error) {
    console.error('Error during user login:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// Export the controller functions
module.exports = {
  signup,
  login, // Export the new login function
};
