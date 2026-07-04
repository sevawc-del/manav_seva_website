/**
 * ADMIN ACTIVITY MODEL
 *
 * Defines the AdminActivity schema for managing administrative activities and campaigns.
 * Admin activities represent special programs, campaigns, or initiatives that are
 * managed by the administrative team. These differ from regular activities and
 * may include problem-action-result frameworks for impact measurement.
 *
 * Schema:
 * - name: Activity name
 * - slug: URL-friendly identifier
 * - description: Brief activity description
 * - problem: Problem statement (PAR framework)
 * - action: Actions taken (PAR framework)
 * - result: Results achieved (PAR framework)
 * - impactNumber: Quantitative impact metric
 * - content: Detailed content (rich text)
 * - image: Activity image URL
 * - isActive: Whether activity is active
 * - order: Display order
 * - timestamps: Created and updated dates
 */

// ==================== IMPORTS ====================
const mongoose = require('mongoose');

// ==================== SCHEMA DEFINITION ====================

/**
 * Admin Activity Schema
 *
 * Fields:
 * - name (String, required): Full name of the administrative activity
 *   e.g., "COVID-19 Relief Campaign", "Education Drive 2024"
 * - slug (String, required, unique): URL-friendly identifier
 *   Used for routing: /admin-activities/health-campaigns
 *   Must be unique across all admin activities
 * - description (String, required): Brief summary of the activity
 *   Used in listings and previews
 * - problem (String, default=''): Problem statement (PAR framework)
 *   Describes the issue or challenge being addressed
 * - action (String, default=''): Actions taken (PAR framework)
 *   Details the interventions and activities implemented
 * - result (String, default=''): Results achieved (PAR framework)
 *   Outcomes and achievements from the activity
 * - impactNumber (String, default=''): Quantitative impact metric
 *   e.g., "5000 people benefited", "100 villages covered"
 * - content (String, required): Detailed activity content (rich text/HTML)
 *   Full description with images, data, and narratives
 * - image (String): Featured image URL from Cloudinary (optional)
 *   Used for activity banners and social media sharing
 * - isActive (Boolean, default=true): Whether activity is currently active
 *   Inactive activities are hidden from public view
 * - order (Number, default=0): Display order priority (ascending)
 *   Lower numbers appear first in listings
 * - createdAt (Date, default=now): When activity was created
 * - updatedAt (Date, default=now): When activity was last modified
 */
const adminActivitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, // e.g., 'health-campaigns'
  description: { type: String, required: true },
  problem: { type: String, default: '' },
  action: { type: String, default: '' },
  result: { type: String, default: '' },
  impactNumber: { type: String, default: '' },
  content: { type: String, required: true }, // Rich text content
  image: { type: String }, // Image URL
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }, // For sorting
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ==================== EXPORTS ====================
// Create and export the AdminActivity model
module.exports = mongoose.model('AdminActivity', adminActivitySchema);
