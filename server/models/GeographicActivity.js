/**
 * GEOGRAPHIC ACTIVITY MODEL
 *
 * Defines the GeographicActivity schema for managing location-specific activities.
 * Geographic activities represent programs or initiatives that are tied to
 * specific geographic locations (states, districts, cities). These are used
 * to populate the interactive geographic map on the website.
 *
 * Schema:
 * - name: Activity/program name
 * - description: Detailed activity description
 * - image: Activity image URL (optional)
 * - timestamps: Created and updated dates
 */

// ==================== IMPORTS ====================
const mongoose = require('mongoose');

// ==================== SCHEMA DEFINITION ====================

/**
 * Geographic Activity Schema
 *
 * Fields:
 * - name (String, required): Name of the activity or program
 *   e.g., "Rural Development Initiative", "Urban Health Program"
 * - description (String, required): Detailed description of the activity
 *   including goals, impact, and implementation details
 * - image (String, default=''): Activity image URL from Cloudinary (optional)
 *   Used for visual representation on maps or activity pages
 * - createdAt (Date, auto): When activity was created
 * - updatedAt (Date, auto): When activity was last modified
 *
 * Note: Geographic activities are linked to specific locations through
 * the GeographicActivityPresence model, which connects activities to
 * states/districts with additional location-specific details.
 */
const geographicActivitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: '' },
}, {
  // ==================== SCHEMA OPTIONS ====================
  /**
   * Enable automatic timestamps (createdAt, updatedAt)
   * These fields are automatically managed by Mongoose
   */
  timestamps: true
});

// ==================== EXPORTS ====================
// Create and export the GeographicActivity model
module.exports = mongoose.model('GeographicActivity', geographicActivitySchema);
