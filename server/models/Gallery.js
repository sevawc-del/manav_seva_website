/**
 * GALLERY MODEL
 * 
 * Defines the Gallery schema for storing photo gallery items.
 * Gallery images are displayed in a photo gallery on the website.
 * 
 * Schema:
 * - title: Photo/caption title
 * - image: Image URL from Cloudinary CDN
 * - description: Optional detailed description
 * - date: When photo was added to gallery
 * - showOnHome: Toggle visibility on homepage carousel
 */

// ==================== IMPORTS ====================
const mongoose = require('mongoose');

// ==================== SCHEMA DEFINITION ====================

/**
 * Gallery Schema
 * 
 * Fields:
 * - title (String, required): Photo/image title or caption
 * - image (String, required): Image URL stored on Cloudinary CDN
 * - description (String): Optional longer description of the image
 * - date (Date, default=now): When image was added to gallery
 * - showOnHome (Boolean, default=true): Display on homepage image carousel
 */
const gallerySchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true              // Every gallery item must have a title
  },
  image: { 
    type: String, 
    required: true              // Image URL from Cloudinary is required
  },
  description: { 
    type: String                // Optional longer description (no requirement)
  },
  date: { 
    type: Date, 
    default: Date.now           // Auto-set to current time when added
  },
  showOnHome: { 
    type: Boolean, 
    default: true               // Show on homepage carousel by default
  }
});

// ==================== EXPORTS ====================
// Create and export the Gallery model
module.exports = mongoose.model('Gallery', gallerySchema);
