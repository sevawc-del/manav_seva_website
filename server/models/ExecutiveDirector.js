/**
 * EXECUTIVE DIRECTOR MODEL
 *
 * Defines the ExecutiveDirector schema for managing executive director information and messages.
 * The executive director is the chief executive of the organization. This model stores
 * their profile information and leadership messages that are prominently displayed
 * on the website to represent organizational leadership.
 *
 * Schema:
 * - name: Executive director's full name
 * - position: Official position title
 * - message: Leadership message content
 * - image: Profile photo URL (optional)
 */

// ==================== IMPORTS ====================
const mongoose = require('mongoose');

// ==================== SCHEMA DEFINITION ====================

/**
 * Executive Director Schema
 *
 * Fields:
 * - name (String, required): Full name of the executive director
 *   e.g., "Dr. Anjali Gupta", "Mr. Ramesh Singh"
 * - position (String, required): Official position title
 *   Typically "Executive Director" or similar
 * - message (String, required): Leadership message content (rich text/HTML)
 *   Contains vision, mission, or organizational updates from the ED
 * - image (String): Profile photo URL from Cloudinary (optional)
 *   Used for visual representation and credibility
 *
 * Note: This model represents the current executive director.
 * Historical executive directors might be stored separately or
 * their messages archived in a different collection.
 */
const executiveDirectorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  message: { type: String, required: true },
  image: { type: String },
});

// ==================== EXPORTS ====================
// Create and export the ExecutiveDirector model
module.exports = mongoose.model('ExecutiveDirector', executiveDirectorSchema);
