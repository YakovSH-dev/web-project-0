const jwt = require('jsonwebtoken');
const User = require('../models/User.model.js');

// Get JWT secret from environment variables
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.error("FATAL ERROR: JWT_SECRET is not defined for protectRoute middleware.");
  // Optionally exit, or just prevent routes from working if secret is missing
  // process.exit(1);
}

const protectRoute = async (req, res, next) => {
  let token;

  // Check for token in Authorization header (Bearer Token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (Bearer TOKEN_STRING)
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        console.log('ProtectRoute: No token found after Bearer split');
        return res.status(401).json({ message: 'Not authorized, no token provided' });
      }
      
      if (!jwtSecret) { // Double check secret existence before verify
         console.error('ProtectRoute: JWT_SECRET is missing, cannot verify token.');
         return res.status(500).json({ message: 'Server configuration error' });
      }

      // Verify token
      const decoded = jwt.verify(token, jwtSecret);

      // Attach user ID to the request object for subsequent middleware/controllers
      // Optionally: Fetch the full user object here if needed often, but adds overhead
      // req.user = await User.findById(decoded.userId).select('-password');
      req.user = { userId: decoded.userId }; // Attach decoded user ID

      console.log(`ProtectRoute: Token verified for userId: ${req.user.userId}`);
      next(); // Proceed to the next middleware or route handler

    } catch (error) {
      console.error('Error verifying token in protectRoute:', error.message);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Not authorized, token failed verification' });
      } else if (error.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Not authorized, token expired' });
      } else {
         return res.status(401).json({ message: 'Not authorized, general token error' });
      }
    }
  } else {
    console.log('ProtectRoute: No Bearer token found in Authorization header');
    res.status(401).json({ message: 'Not authorized, no token (Bearer format expected)' });
  }
};

module.exports = protectRoute; 