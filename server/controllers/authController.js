/**
 * AUTHENTICATION CONTROLLER
 * 
 * Handles user authentication operations:
 * - User registration (sign-up)
 * - User login (sign-in with JWT token)
 * - Admin user creation (admin-only operation)
 * 
 * Security Features:
 * - Passwords hashed with bcryptjs (10 salt rounds)
 * - JWT tokens with 1-hour expiration
 * - Token contains user ID and role for authorization
 * 
 * Authentication Flow:
 * 1. User registers or logs in
 * 2. Password is validated/hashed
 * 3. JWT token generated with user data
 * 4. Token stored in browser localStorage
 * 5. Token included in all subsequent API requests
 * 6. authMiddleware verifies token on protected routes
 */

// ==================== IMPORTS ====================
const User = require('../models/User');        // User database model
const bcrypt = require('bcryptjs');            // Password hashing library
const jwt = require('jsonwebtoken');           // JSON Web Token creation/verification

// ==================== CONTROLLER FUNCTIONS ====================

/**
 * POST /api/auth/register
 * Register New User
 * 
 * Creates a new user account with provided credentials.
 * Password is hashed before storage (never store plain text passwords!).
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.username - Desired username (must be unique)
 * @param {string} req.body.email - User email address (must be unique)
 * @param {string} req.body.password - User password (min 8 characters, see validationMiddleware)
 * @param {Object} res - Express response object
 * 
 * @returns {JSON} { message: "User registered successfully" } (201 Created)
 * @throws {400} Invalid request data (duplicate username/email or validation error)
 * 
 * Security Process:
 * 1. Receive plain text password
 * 2. Hash password using bcryptjs with 10 salt rounds
 * 3. Create User document with hashed password
 * 4. Save to database
 * 5. Return success response (never return password or token)
 * 
 * Salt Rounds Explanation:
 * - Higher number = more secure but slower hashing
 * - 10 rounds is industry standard
 * - Bcrypt automatically slows down as computers get faster
 * 
 * Error Handling:
 * - 400: Username or email already exists (unique constraint)
 * - 400: Validation failed (invalid email format, etc.)
 */
const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Hash password with bcryptjs (10 salt rounds for security)
    // This prevents storing plain text passwords
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user with hashed password
    const user = new User({ 
      username, 
      email, 
      password: hashedPassword  // Never store plain password!
    });
    
    // Save user to database
    await user.save();
    
    // Return success response (201 = Created)
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    // 400: Likely duplicate username/email or validation error
    res.status(400).json({ message: 'Invalid request data' });
  }
};

/**
 * POST /api/auth/login
 * User Login (Sign-In)
 * 
 * Authenticates user and returns JWT token for subsequent requests.
 * Token is stored in browser localStorage and sent with all API requests.
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User email address
 * @param {string} req.body.password - User password (plain text)
 * @param {Object} res - Express response object
 * 
 * @returns {JSON} { token: "eyJhbGc...", role: "admin"|"user" } (200 OK)
 * @throws {400} Invalid email or password
 * @throws {500} Internal Server Error
 * 
 * Login Process:
 * 1. Find user by email
 * 2. Compare provided password with stored hashed password
 * 3. Generate JWT token with user ID and role
 * 4. Return token (client stores in localStorage)
 * 5. Client includes token in "Authorization: Bearer {token}" header
 * 
 * JWT Token Contents:
 * - id: User's MongoDB ObjectID (used to identify user)
 * - role: User's role ('admin' or 'user') - used for authorization
 * - exp: Expiration time (1 hour from now)
 * - iat: Issued at time
 * 
 * Token Example (decoded):
 * {
 *   "id": "123abc456def789",
 *   "role": "admin",
 *   "iat": 1704067200,
 *   "exp": 1704070800
 * }
 * 
 * Error Scenarios:
 * - User not found: Return "Invalid credentials" (don't reveal if email exists)
 * - Password wrong: Return "Invalid credentials" (don't reveal password is wrong)
 * - Database error: Return 500 error
 */
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user in database by email
    const user = await User.findOne({ email });
    
    // User not found
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    
    // Compare provided password with stored hashed password
    // bcrypt.compare() returns true if passwords match
    const isMatch = await bcrypt.compare(password, user.password);
    
    // Password does not match
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    
    // ========== Generate JWT Token ==========
    // Token contains user ID and role for authorization
    // Expires in 1 hour for security
    const token = jwt.sign(
      { 
        id: user._id,      // User's MongoDB ID
        role: user.role    // User's role ('admin' or 'user')
      }, 
      process.env.JWT_SECRET,  // Secret key to sign token (from environment)
      { expiresIn: '1h' }      // Token expires in 1 hour
    );
    
    // Return token and role to client
    // Client stores token in localStorage
    res.json({ 
      token,                // JWT token to include in future requests
      role: user.role       // User's role for UI/permission decisions
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * POST /api/auth/admin
 * Create Admin User (Admin-Only Operation)
 * 
 * Creates a new admin user account.
 * Should only be accessible to existing admins (protected route).
 * Allows admins to create additional admin accounts or staff accounts.
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.username - Admin username (must be unique)
 * @param {string} req.body.email - Admin email (must be unique)
 * @param {string} req.body.password - Admin password (min 8 characters)
 * @param {Object} res - Express response object
 * 
 * @returns {JSON} { message: "Admin user created successfully" } (201 Created)
 * @throws {400} Invalid request data or duplicate username/email
 * @throws {403} Forbidden (if not admin - checked in route middleware)
 * 
 * Similar to register() but:
 * - Creates user with role: 'admin' instead of default 'user'
 * - Should be protected with admin middleware
 * - Used only by existing admins to add team members
 * 
 * Note: The route using this controller should include:
 * router.post('/admin', protect, admin, createAdmin);
 * to ensure only authenticated admins can create admin users
 */
const createAdmin = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Hash password with bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create admin user (note: role = 'admin')
    const user = new User({ 
      username, 
      email, 
      password: hashedPassword,
      role: 'admin'  // Set role to admin
    });
    
    // Save to database
    await user.save();
    
    // Return success response
    res.status(201).json({ message: 'Admin user created successfully' });
  } catch (error) {
    // 400: Duplicate username/email or validation error
    res.status(400).json({ message: 'Invalid request data' });
  }
};

// ==================== EXPORTS ====================
module.exports = {
  register,      // POST /api/auth/register
  login,         // POST /api/auth/login
  createAdmin,   // POST /api/auth/admin (admin-only)
};

