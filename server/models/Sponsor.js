/**
 * SPONSOR MODEL
 *
 * Defines the Sponsor schema for managing organizational sponsors and partners.
 * Sponsors are displayed on the website to show organizational partnerships
 * and funding sources. Different tiers allow for visual hierarchy in display.
 *
 * Schema:
 * - name: Sponsor/partner organization name
 * - logo: Logo image URL from Cloudinary
 * - website: Sponsor's website URL (optional)
 * - tier: Sponsorship level (strategic, program, community, other)
 * - order: Display order within tier
 * - isActive: Whether sponsor is currently active
 * - timestamps: Created and updated dates
 */

// ==================== IMPORTS ====================
const mongoose = require('mongoose');

// ==================== SCHEMA DEFINITION ====================

/**
 * Sponsor Schema
 *
 * Fields:
 * - name (String, required): Full name of the sponsoring organization/partner
 * - logo (String, required): Logo image URL from Cloudinary CDN
 * - website (String, default=''): Sponsor's website URL (optional)
 * - tier (String, enum, default='community'): Sponsorship level
 *   - 'strategic': Major strategic partners
 *   - 'program': Program-specific sponsors
 *   - 'community': Community-level supporters
 *   - 'other': Other partnership types
 * - order (Number, default=0): Display order within the same tier (ascending)
 * - isActive (Boolean, default=true): Controls sponsor visibility
 *   Inactive sponsors are hidden from the website
 * - createdAt (Date, auto): When sponsor was added
 * - updatedAt (Date, auto): When sponsor was last modified
 */
const sponsorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    logo: { type: String, required: true, trim: true },
    website: { type: String, default: '', trim: true },
    tier: {
      type: String,
      enum: ['strategic', 'program', 'community', 'other'],
      default: 'community'
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  {
    // ==================== SCHEMA OPTIONS ====================
    /**
     * Enable automatic timestamps (createdAt, updatedAt)
     * These fields are automatically managed by Mongoose
     */
    timestamps: true
  }
);

// ==================== EXPORTS ====================
// Create and export the Sponsor model
module.exports = mongoose.model('Sponsor', sponsorSchema);
