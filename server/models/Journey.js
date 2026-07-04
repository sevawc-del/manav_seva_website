/**
 * JOURNEY MODEL
 *
 * Defines the Journey schema for managing organizational milestones and history.
 * Journey entries represent significant years in the organization's development,
 * with key achievements and milestones. Displayed chronologically on the
 * "Our Journey" or "History" page.
 *
 * Schema:
 * - year: The year being documented
 * - summary: Brief overview of the year's activities
 * - milestones: Array of key achievements/events
 * - isActive: Whether journey entry is visible
 * - order: Display order (for custom sorting)
 * - timestamps: Created and updated dates
 */

// ==================== IMPORTS ====================
const mongoose = require('mongoose');

// ==================== SCHEMA DEFINITION ====================

/**
 * Journey Schema
 *
 * Fields:
 * - year (Number, required): The year being documented (e.g., 2024, 1988)
 *   Used for chronological sorting and display
 * - summary (String, default=''): Brief overview of the year's activities
 *   and overall achievements
 * - milestones (Array of Strings, required): Key achievements and events
 *   Each milestone is a separate string describing a significant event
 *   e.g., ["Established first community center", "Reached 1000 beneficiaries"]
 * - isActive (Boolean, default=true): Whether journey entry is visible
 *   Inactive entries are hidden from the journey timeline
 * - order (Number, default=0): Custom display order (ascending)
 *   Allows manual ordering if chronological sorting isn't desired
 * - createdAt (Date, default=now): When journey entry was created
 * - updatedAt (Date, default=now): When journey entry was last modified
 */
const journeySchema = new mongoose.Schema({
  year: { type: Number, required: true },
  summary: { type: String, default: '' },
  milestones: [{ type: String, required: true }], // Array of milestone descriptions
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }, // For sorting
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ==================== EXPORTS ====================
// Create and export the Journey model
module.exports = mongoose.model('Journey', journeySchema);
