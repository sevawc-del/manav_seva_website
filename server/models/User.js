/**
 * USER MODEL
 * 
 * Defines the User schema for authentication and authorization.
 * Stores credentials and role information for admin/user accounts.
 * 
 * Schema:
 * - username: Unique identifier, case-sensitive
 * - email: Unique email address, used for login
 * - password: Hashed password (never store plain text!)
 * - role: User role for access control (e.g., 'admin', 'user')
 */

// ==================== IMPORTS ====================
const mongoose = require('mongoose');

// ==================== SCHEMA DEFINITION ====================

/**
 * User Schema
 * 
 * Fields:
 * - username (String, required, unique): User login identifier
 * - email (String, required, unique): User email address
 * - password (String, required): Hashed password (bcrypt)
 * - role (String, default='user'): User role for permission management
 */
const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true,        // Must be provided
    unique: true           // Cannot have duplicate usernames
  },
  email: { 
    type: String, 
    required: true,        // Must be provided
    unique: true           // Cannot have duplicate emails
  },
  password: { 
    type: String, 
    required: true         // Must be provided (should be hashed with bcrypt)
  },
  role: { 
    type: String, 
    default: 'user'        // Default role is regular user
    // Possible values: 'user', 'admin', 'moderator', etc.
  },
});

// ==================== EXPORTS ====================
// Create and export the User model
module.exports = mongoose.model('User', userSchema);
