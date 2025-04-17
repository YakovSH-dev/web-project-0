// server/middleware/auth.middleware.js

const jwt = require('jsonwebtoken');
// Ensure JWT_SECRET is loaded from environment variables
const jwtSecret = process.env.JWT_SECRET; 

// Middleware function to protect routes
const protectRoute = (req, res, next) => {
  // 1. Get token from header
  // Tokens are usually sent in the Authorization header with the Bearer scheme: Authorization: Bearer <token>
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Extract the token part after "Bearer "
    token = authHeader.split(' ')[1];
  }

  // 2. Check if token exists
  if (!token) {
    console.log('Auth Middleware: No token found in Authorization header.');
    // 401 Unauthorized - Use return to stop execution here
    return res.status(401).json({ message: 'Not authorized, no token provided' }); 
  }

  // 3. Verify token
  try {
    // jwt.verify() decodes the token and verifies its signature using the secret
    // If invalid or expired, it throws an error
    const decoded = jwt.verify(token, jwtSecret);

    // 4. Attach user info to request object
    // We stored userId and email in the payload when creating the token during login
    // Attach this decoded payload (or parts of it) to req.user
    // Route handlers downstream can now access req.user.userId, req.user.email etc.
    req.user = { 
        userId: decoded.userId, 
        email: decoded.email 
        // Add any other payload data you included
    }; 
    console.log(`Auth Middleware: Token verified for user ${req.user.email}`);

    // 5. Call next() to pass control to the next middleware or route handler
    next(); 

  } catch (error) {
    // Handle verification errors (e.g., invalid signature, expired token)
    console.error('Auth Middleware: Token verification failed:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Not authorized, token invalid' });
    } 
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Not authorized, token expired' });
    }
    // Handle other potential errors
    return res.status(500).json({ message: 'Server error during token verification' });
  }
};

// Export the middleware function
module.exports = protectRoute;
