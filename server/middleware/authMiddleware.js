/**
 * AUTHENTICATION MIDDLEWARE
 * 
 * Handles JWT token verification and authorization checks.
 * All protected routes must pass through this middleware.
 */

// ==================== IMPORTS ====================
const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware (protect route)
 * 
 * Verifies JWT token from Authorization header and extracts user information.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @returns {void} - Calls next() if token valid, or sends 401/403 error
 * 
 * Expected Authorization header format: "Bearer <token>"
 * 
 * Usage in routes:
 *   router.post('/create', protect, controller.create);
 */
const authMiddleware = (req, res, next) => {
  // Extract token from Authorization header (format: "Bearer token_string")
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  // If no token found, deny access
  if (!token) return res.status(401).json({ message: 'Access denied' });
  
  try {
    // Verify token signature using JWT_SECRET from environment
    // If valid, decoded contains user info (id, role, email, etc.)
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach decoded user info to request object for use in controllers
    req.user = verified;
    
    // Pass control to next middleware/route handler
    next();
  } catch (error) {
    // Token is invalid or expired
    res.status(401).json({ message: 'Invalid token' });
  }
};

/**
 * Admin Middleware (protect admin route)
 * 
 * Checks if authenticated user has 'admin' role.
 * Must be used AFTER authMiddleware so req.user is populated.
 * 
 * @param {Object} req - Express request object (must have req.user from authMiddleware)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @returns {void} - Calls next() if user is admin, or sends 403 error
 * 
 * Usage in routes:
 *   router.delete('/:id', protect, admin, controller.delete);
 */
const adminMiddleware = (req, res, next) => {
  // Check if user exists and has admin role
  if (req.user && req.user.role === 'admin') {
    // User is authorized as admin, proceed
    next();
  } else {
    // User is not an admin, deny access with 403 Forbidden
    res.status(403).json({ message: 'Admin access required' });
  }
};

// ==================== EXPORTS ====================
module.exports = { 
  protect: authMiddleware,  // For protecting routes with authentication
  admin: adminMiddleware    // For protecting routes with admin role
};
