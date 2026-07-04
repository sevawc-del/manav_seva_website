/**
 * RATE LIMITING MIDDLEWARE
 * 
 * Prevents abuse by limiting the number of requests from a single IP/endpoint
 * within a specified time window. Helps protect against DDoS and brute force attacks.
 * 
 * Uses in-memory storage (Map) to track request timestamps.
 * NOTE: For production with multiple server instances, use Redis instead.
 */

// ==================== STATE ====================

/**
 * In-Memory Request Tracker
 * 
 * Stores request timestamps per endpoint and IP address.
 * Key format: "{path}:{ip_address}"
 * Value: Array of timestamps for requests to that endpoint from that IP
 * 
 * Example:
 * "/api/auth/login:192.168.1.1" => [1704067200000, 1704067205000, 1704067210000]
 */
const windows = new Map();

/**
 * Rate Limiter Factory Function
 * 
 * Creates a middleware function with specified rate limit parameters.
 * Returns middleware that checks if request count exceeds limit.
 * 
 * @param {Object} config - Rate limit configuration
 * @param {number} config.windowMs - Time window in milliseconds (e.g., 15 * 60 * 1000 = 15 minutes)
 * @param {number} config.maxRequests - Maximum requests allowed in the time window
 * @param {string} config.message - Error message to return when limit exceeded
 * 
 * @returns {Function} Middleware function (req, res, next)
 * 
 * Usage:
 *   const loginLimiter = createRateLimiter({
 *     windowMs: 15 * 60 * 1000,  // 15 minutes
 *     maxRequests: 5,              // 5 requests max
 *     message: 'Too many login attempts'
 *   });
 *   router.post('/login', loginLimiter, controller.login);
 */
const createRateLimiter = ({ windowMs, maxRequests, message }) => {
  return (req, res, next) => {
    // Create unique key combining endpoint path and client IP address
    const key = `${req.path}:${req.ip}`;
    
    // Get current time in milliseconds
    const now = Date.now();
    
    // Calculate start time of current rate limit window
    const windowStart = now - windowMs;
    
    // Get all timestamps for this endpoint+IP, filter to only those within current window
    // This removes old requests outside the time window
    const timestamps = (windows.get(key) || []).filter((ts) => ts > windowStart);

    // Check if request count exceeds the maximum allowed
    if (timestamps.length >= maxRequests) {
      // Rate limit exceeded, return 429 Too Many Requests error
      return res.status(429).json({ message });
    }

    // Add current request timestamp to the list
    timestamps.push(now);
    
    // Update the Map with new timestamp list
    windows.set(key, timestamps);
    
    // Allow request to proceed to next middleware
    next();
  };
};

// ==================== EXPORTS ====================
module.exports = {
  createRateLimiter
};
