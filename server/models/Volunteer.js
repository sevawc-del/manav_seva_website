/**
 * VOLUNTEER MODEL
 *
 * Defines the Volunteer schema for managing volunteer opportunities.
 * Volunteer positions are posted on the website for people interested
 * in contributing to the organization's work. Different types of
 * volunteer roles with varying commitment levels.
 *
 * Schema:
 * - title: Position title
 * - description: Detailed job description
 * - requirements: Skills/experience needed
 * - location: Where the volunteer work takes place
 * - type: Type of volunteer commitment
 * - commitment: Time commitment details
 * - applicationDeadline: When applications close
 * - isActive: Whether position is currently open
 * - timestamps: Created and updated dates
 */

// ==================== IMPORTS ====================
const mongoose = require('mongoose');

// ==================== SCHEMA DEFINITION ====================

/**
 * Volunteer Schema
 *
 * Fields:
 * - title (String, required): Volunteer position title
 *   e.g., "Community Outreach Coordinator", "Event Volunteer"
 * - description (String, required): Detailed description of the role
 *   and responsibilities
 * - requirements (String, required): Required skills, experience, or qualifications
 * - location (String, required): Physical location or "Remote"
 * - type (String, enum, required): Type of volunteer commitment
 *   - 'short-term': One-time or brief commitment (days/weeks)
 *   - 'long-term': Ongoing commitment (months/years)
 *   - 'event-based': Specific to particular events
 * - commitment (String): Time commitment details (optional)
 *   e.g., "2-4 hours per week", "Full day event"
 * - applicationDeadline (Date): When applications are no longer accepted
 *   Optional - some positions may be ongoing
 * - isActive (Boolean, default=true): Whether position is currently open
 *   Inactive positions are hidden from the volunteer page
 * - createdAt (Date, default=now): When position was posted
 * - updatedAt (Date, default=now): When position was last modified
 */
const volunteerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  requirements: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, enum: ['short-term', 'long-term', 'event-based'], required: true },
  commitment: { type: String },
  applicationDeadline: { type: Date },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ==================== EXPORTS ====================
// Create and export the Volunteer model
module.exports = mongoose.model('Volunteer', volunteerSchema);
