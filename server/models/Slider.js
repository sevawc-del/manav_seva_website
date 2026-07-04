/**
 * SLIDER MODEL
 *
 * Defines the Slider schema for homepage carousel/slider images.
 * Manages the rotating banner images displayed on the website homepage.
 * Each slider item contains an image, title, subtitle, and optional call-to-action button.
 *
 * Schema:
 * - title: Main headline text for the slide
 * - subtitle: Secondary descriptive text
 * - image: Banner image URL from Cloudinary
 * - order: Display order/priority (lower numbers first)
 * - isActive: Whether slide is currently visible
 * - buttonText: Call-to-action button text
 * - buttonLink: URL the button links to
 * - timestamps: Created and updated dates
 */

// ==================== IMPORTS ====================
const mongoose = require('mongoose');

// ==================== SCHEMA DEFINITION ====================

/**
 * Slider Schema
 *
 * Fields:
 * - title (String, required): Main headline displayed on the slide
 * - subtitle (String, required): Secondary descriptive text under the title
 * - image (String, required): Banner image URL from Cloudinary CDN
 * - order (Number, default=0): Sort order for slide display (ascending)
 *   Lower numbers appear first in the carousel
 * - isActive (Boolean, default=true): Controls slide visibility
 *   Inactive slides are hidden from the homepage carousel
 * - buttonText (String, default='Learn More'): Call-to-action button text
 * - buttonLink (String, default='/about/about-us'): URL for button link
 *   Defaults to About Us page
 * - createdAt (Date, default=now): When slide was created
 * - updatedAt (Date, default=now): When slide was last modified
 */
const sliderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  image: { type: String, required: true }, // Image URL from Cloudinary
  order: { type: Number, default: 0 }, // For sorting
  isActive: { type: Boolean, default: true },
  buttonText: { type: String, default: 'Learn More' },
  buttonLink: { type: String, default: '/about/about-us' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ==================== EXPORTS ====================
// Create and export the Slider model
module.exports = mongoose.model('Slider', sliderSchema);
