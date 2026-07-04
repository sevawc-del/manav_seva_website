/**
 * ABOUT US MODEL
 *
 * Defines the About Us schema for storing organizational information.
 * Contains the main "About Us" page content, mission, and vision statements.
 * Displayed on the public website's About Us page.
 *
 * Schema:
 * - title: Page title
 * - content: Main about us content (rich text)
 * - image: Featured image URL from Cloudinary
 * - mission: Organization's mission statement
 * - vision: Organization's vision statement
 */

// ==================== IMPORTS ====================
const mongoose = require('mongoose');

// ==================== SCHEMA DEFINITION ====================

/**
 * About Us Schema
 *
 * Fields:
 * - title (String, required): Page title (e.g., "About Manav Seva")
 * - content (String, required): Main about us content (HTML/Markdown)
 * - image (String): Featured image URL from Cloudinary CDN
 * - mission (String, default=''): Organization's mission statement
 * - vision (String, default=''): Organization's vision statement
 */
const aboutUsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true              // Page must have a title
  },
  content: {
    type: String,
    required: true              // Main content is required
  },
  image: {
    type: String                // Featured image URL (optional)
  },
  mission: {
    type: String,
    default: ''                 // Mission statement (optional)
  },
  vision: {
    type: String,
    default: ''                 // Vision statement (optional)
  },
});

// ==================== EXPORTS ====================
// Create and export the AboutUs model
module.exports = mongoose.model('AboutUs', aboutUsSchema);
