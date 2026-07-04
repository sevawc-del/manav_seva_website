/**
 * GEOGRAPHIC FOCUS MODEL
 *
 * Defines the GeographicFocus schema for managing the geographic focus page content.
 * This model stores the main content for the "Geographic Focus" page, which explains
 * where the organization works and displays the interactive India map showing
 * current and past program locations.
 *
 * Schema:
 * - title: Page title
 * - content: Main page content
 * - image: Featured image URL
 * - showMap: Whether to display the interactive map
 * - mapImage: Static map image URL (fallback)
 */

// ==================== IMPORTS ====================
const mongoose = require('mongoose');

// ==================== SCHEMA DEFINITION ====================

/**
 * Geographic Focus Schema
 *
 * Fields:
 * - title (String, required): Page title for the geographic focus section
 *   e.g., "Our Geographic Focus", "Where We Work"
 * - content (String, required): Main content explaining geographic presence
 *   and program distribution across India
 * - image (String): Featured image URL from Cloudinary (optional)
 *   Used as a banner or header image for the page
 * - showMap (Boolean, default=false): Whether to display the interactive map
 *   If true, shows the D3.js India map with state-level program data
 * - mapImage (String): Static map image URL (optional)
 *   Fallback image if interactive map is disabled or for print versions
 *
 * Note: The interactive map data comes from SiteSettings.homeGeographicFocusStates
 * and GeographicActivityPresence collections, not directly from this model.
 */
const geographicFocusSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },
  showMap: { type: Boolean, default: false },
  mapImage: { type: String },
});

// ==================== EXPORTS ====================
// Create and export the GeographicFocus model
module.exports = mongoose.model('GeographicFocus', geographicFocusSchema);
