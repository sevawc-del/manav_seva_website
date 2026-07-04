/**
 * NEWS MODEL
 * 
 * Defines the News schema for managing news articles and updates.
 * News items are displayed on the public website and admin dashboard.
 * 
 * Schema:
 * - title: Headline of the news article
 * - slug: URL-friendly identifier for SEO and routing
 * - content: Full article text in markdown or HTML format
 * - date: Publication date (defaults to current time)
 * - image: Featured image URL (stored on Cloudinary)
 */

// ==================== IMPORTS ====================
const mongoose = require('mongoose');

// ==================== SCHEMA DEFINITION ====================

/**
 * News Schema
 * 
 * Fields:
 * - title (String, required): News headline/title
 * - slug (String, unique, indexed): URL-friendly slug for routing and SEO
 *   Example: "important-announcement" instead of "Important Announcement"
 * - content (String, required): Full article content (rich text format)
 * - date (Date, default=now): Publication date and time
 * - image (String): URL of featured/header image (from Cloudinary CDN)
 */
const newsSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true              // News must have a title
  },
  slug: { 
    type: String, 
    unique: true,               // Each article needs unique slug for URL
    index: true,                // Index for faster slug-based lookups
    sparse: true                // Allow null values but enforce uniqueness for non-null
  },
  content: { 
    type: String, 
    required: true              // Article body is required
  },
  date: { 
    type: Date, 
    default: Date.now           // Auto-set to current time if not provided
  },
  image: { 
    type: String                // Featured image URL (no requirement, image is optional)
  },
});

// ==================== EXPORTS ====================
// Create and export the News model
module.exports = mongoose.model('News', newsSchema);
