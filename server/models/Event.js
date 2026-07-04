/**
 * EVENT MODEL
 *
 * Defines the Event schema for managing organizational events and programs.
 * Events are displayed on the public website and can be featured on homepage.
 * Supports both online and offline events with registration links.
 *
 * Schema:
 * - title: Event name/title
 * - slug: URL-friendly identifier for routing
 * - description: Short event summary
 * - content: Detailed event information (rich text)
 * - image: Event banner/image URL
 * - startDateTime: When event begins
 * - endDateTime: When event ends (optional)
 * - location: Physical location or online platform
 * - isOnline: Whether event is virtual
 * - registrationLink: URL for event registration
 * - isPublished: Whether event is visible to public
 * - isFeatured: Whether to feature on homepage
 * - timestamps: Created and updated dates
 */

// ==================== IMPORTS ====================
const mongoose = require('mongoose');

// ==================== SCHEMA DEFINITION ====================

/**
 * Event Schema
 *
 * Fields:
 * - title (String, required): Event title/name
 * - slug (String, unique, indexed, sparse): URL-friendly slug for routing
 *   Example: "annual-fundraiser-2024" (used in URL: /events/annual-fundraiser-2024)
 * - description (String, default=''): Short event summary for listings
 * - content (String, required): Detailed event information (HTML/Markdown)
 * - image (String, default=''): Event banner/image URL from Cloudinary
 * - startDateTime (Date, required): When the event begins
 * - endDateTime (Date): When the event ends (optional for single-day events)
 * - location (String, default=''): Physical address or online platform name
 * - isOnline (Boolean, default=false): Whether event is virtual/online
 * - registrationLink (String, default=''): URL for event registration/sign-up
 * - isPublished (Boolean, default=true): Controls public visibility
 * - isFeatured (Boolean, default=false): Feature on homepage carousel
 * - createdAt (Date, default=now): When event was created
 * - updatedAt (Date, default=now): When event was last modified
 */
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true              // Event must have a title
  },
  slug: {
    type: String,
    unique: true,               // Each event has unique slug for URL
    index: true,                // Indexed for fast slug-based lookups
    sparse: true                // Allow null values but enforce uniqueness for non-null
  },
  description: {
    type: String,
    default: ''                 // Short summary for event listings
  },
  content: {
    type: String,
    required: true              // Detailed event content is required
  },
  image: {
    type: String,
    default: ''                 // Event banner image URL (optional)
  },
  startDateTime: {
    type: Date,
    required: true              // Event must have a start time
  },
  endDateTime: {
    type: Date                  // End time (optional for single-day events)
  },
  location: {
    type: String,
    default: ''                 // Physical address or "Zoom/Google Meet"
  },
  isOnline: {
    type: Boolean,
    default: false              // Default to in-person event
  },
  registrationLink: {
    type: String,
    default: ''                 // Registration URL (optional)
  },
  isPublished: {
    type: Boolean,
    default: true               // Events are published by default
  },
  isFeatured: {
    type: Boolean,
    default: false              // Not featured by default
  },
  createdAt: {
    type: Date,
    default: Date.now           // Auto-set when created
  },
  updatedAt: {
    type: Date,
    default: Date.now           // Should be updated when modified
  }
});

// ==================== EXPORTS ====================
// Create and export the Event model
module.exports = mongoose.model('Event', eventSchema);
