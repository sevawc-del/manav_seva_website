/**
 * ACTIVITY PRESENCE MODEL
 *
 * Defines the ActivityPresence schema for linking activities to geographic locations.
 * This junction model connects Activity documents to specific state and district
 * combinations, indicating where each activity/program is implemented.
 * Used for geographic mapping and location-based activity filtering.
 *
 * Schema:
 * - activityId: Reference to the Activity document
 * - stateCode: State code (e.g., "UP", "DL")
 * - districtCode: District code within the state
 * - timestamps: Created and updated dates
 */

// ==================== IMPORTS ====================
const mongoose = require('mongoose');

// ==================== SCHEMA DEFINITION ====================

/**
 * Activity Presence Schema
 *
 * This is a junction table that creates many-to-many relationships
 * between activities and geographic locations (state + district).
 *
 * Fields:
 * - activityId (ObjectId, ref: 'Activity', required): Reference to Activity document
 *   Links this presence record to a specific activity/program
 * - stateCode (String, required): State code identifier
 *   e.g., "UP" for Uttar Pradesh, "DL" for Delhi
 *   Must match codes used in geographic data files
 * - districtCode (String, required): District code within the state
 *   e.g., "GOR" for Gorakhpur, "LKO" for Lucknow
 *   Must be unique within each state
 * - createdAt (Date, auto): When presence record was created
 * - updatedAt (Date, auto): When presence record was last modified
 *
 * Note: This model enables queries like:
 * - Which activities are present in a specific state/district?
 * - Which locations implement a specific activity?
 * - Geographic coverage analysis for activities
 */
const activityPresenceSchema = new mongoose.Schema({
  activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true },
  stateCode: { type: String, required: true },
  districtCode: { type: String, required: true },
}, {
  // ==================== SCHEMA OPTIONS ====================
  /**
   * Enable automatic timestamps (createdAt, updatedAt)
   * These fields are automatically managed by Mongoose
   */
  timestamps: true
});

// ==================== EXPORTS ====================
// Create and export the ActivityPresence model
module.exports = mongoose.model('ActivityPresence', activityPresenceSchema);
