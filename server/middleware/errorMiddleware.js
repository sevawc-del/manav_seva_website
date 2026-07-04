/**
 * ERROR HANDLING MIDDLEWARE
 * 
 * Central error handler for catching and formatting error responses.
 * This should be the LAST middleware mounted in the application.
 * 
 * Catches errors passed via next(err) or thrown in route handlers wrapped with try/catch.
 */

/**
 * Error Handler Middleware
 * 
 * Catches any errors from route handlers and sends formatted error response.
 * 
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * @returns {void} - Sends HTTP error response with status code and message
 * 
 * Usage:
 *   - In route handler: throw new Error('Something went wrong');
 *   - The error will be caught by this middleware automatically
 * 
 * Note: Must be mounted AFTER all other routes and middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error to console for debugging purposes
  console.error(err.stack);
  
  // Send generic error response with 500 status code
  res.status(500).json({ message: 'Something went wrong!' });
};

// ==================== EXPORTS ====================
module.exports = errorHandler;
