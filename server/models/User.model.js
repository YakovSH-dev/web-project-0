// server/models/User.model.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the schema for the User model
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'], // Make email required
      unique: true, // Ensure email addresses are unique in the collection
      lowercase: true, // Store email in lowercase
      trim: true, // Remove leading/trailing whitespace
    },
    password: {
      type: String,
      required: [true, 'Password is required'], // Make password required
    },

     name: { type: String, trim: true },
    // age: { type: Number }
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true, 
  }
);

// --- Mongoose Middleware (hook) ---

// Pre-save hook to hash password before saving a new user document
// Note: Must use 'function()' not arrow '() =>' to ensure 'this' refers to the document
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next(); // If password not modified, skip hashing and proceed
  }

  try {
    // Generate salt and hash the password
    const saltRounds = 10; // Standard number of salt rounds
    this.password = await bcrypt.hash(this.password, saltRounds);
    console.log(`Password hashed for user: ${this.email}`); // Log hashing success
    next(); // Proceed with the save operation
  } catch (error) {
    console.error(`Error hashing password for user ${this.email}:`, error);
    next(error); // Pass error to the next middleware/save operation
  }
});

// --- Create and Export Model ---

// Create the User model from the schema
// Mongoose will automatically look for the plural, lowercased version of 'User' 
// for the collection name (i.e., 'users')
const User = mongoose.model('User', userSchema);

module.exports = User;
