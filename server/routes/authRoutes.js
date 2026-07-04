/**
 * AUTHENTICATION ROUTES
 * 
 * Defines API endpoints for user authentication.
 * 
 * Base URL: /api/auth
 * 
 * Endpoints:
 * - POST /login       - User login (returns JWT token)
 * 
 * Note: Registration endpoint (POST /register) may exist elsewhere
 * or may not be exposed for security (only admins create accounts)
 */

// ==================== IMPORTS ====================
const express = require('express');
const router = express.Router();

// Import auth controller
const { login } = require('../controllers/authController');

// Import middleware
const { createRateLimiter } = require('../middleware/rateLimitMiddleware');
const { validateLogin } = require('../middleware/validationMiddleware');

// ==================== MIDDLEWARE SETUP ====================

/**
 * Rate Limiter for Authentication Endpoints
 * 
 * Prevents brute force attacks by limiting login attempts.
 * Allows 10 attempts per IP address every 15 minutes.
 * 
 * Configuration:
 * - windowMs: 15 * 60 * 1000 = 15 minutes (time window in milliseconds)
 * - maxRequests: 10 (max attempts per window)
 * - message: Error message when limit exceeded
 * 
 * Returns 429 Too Many Requests if exceeded.
 * 
 * Note: This is in-memory only. For production with multiple servers,
 * implement Redis-based rate limiting for shared state.
 */
const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  maxRequests: 10,            // 10 attempts allowed
  message: 'Too many auth attempts. Please try again later.'
});

// ==================== ROUTES ====================

/**
 * POST /api/auth/login
 * User Login (Authentication Endpoint)
 * 
 * Authenticates user with email and password.
 * Returns JWT token if credentials are valid.
 * 
 * Middleware Stack:
 * 1. authRateLimiter - Prevent brute force (10 attempts per 15 min)
 * 2. validateLogin - Validate input format (email, password)
 * 3. login - Authenticate and return token
 * 
 * Request Body:
 * - email: User email address (required, must be valid email)
 * - password: User password (required, min 1 character)
 * 
 * Response (200 OK):
 * {
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "role": "admin" | "user"
 * }
 * 
 * Error Responses:
 * - 400: Invalid email format or missing password (validation failed)
 * - 400: Email not found or password incorrect (auth failed)
 * - 429: Too many login attempts (rate limit exceeded)
 * - 500: Server error
 * 
 * Security Notes:
 * - Rate limited to prevent brute force attacks
 * - Email and password validation before database lookup
 * - Password never returned in response
 * - Token expires in 1 hour for security
 * - Passwords compared using bcrypt.compare()
 * 
 * Usage:
 * 1. Client sends email and password
 * 2. Server validates input format
 * 3. Server checks database for user
 * 4. Server compares password with bcrypt
 * 5. Server generates JWT token
 * 6. Client stores token in localStorage
 * 7. Client includes token in Authorization header for future requests
 */
router.post('/login', authRateLimiter, validateLogin, login);

// ==================== EXPORTS ====================
module.exports = router;
