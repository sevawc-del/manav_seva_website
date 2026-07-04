/**
 * ORGANIZATION STRUCTURE MODEL
 *
 * Defines the OrganizationStructure schema for managing organizational structure content.
 * This model stores information about the organization's structure, departments,
 * and operational framework. It's displayed on the website to help visitors
 * understand how the organization is structured and operates.
 *
 * Schema:
 * - title: Page title for organization structure
 * - content: Detailed content about organizational structure
 * - image: Featured image URL (optional)
 */

// ==================== IMPORTS ====================
const mongoose = require('mongoose');

// ==================== SCHEMA DEFINITION ====================

/**
 * Organization Structure Schema
 *
 * Fields:
 * - title (String, required): Page title for the organization structure section
 *   e.g., "Our Organization Structure", "How We're Organized"
 * - content (String, required): Detailed content about the organizational structure
 *   Can include information about departments, reporting lines, operational framework,
 *   and how different parts of the organization work together
 * - image (String): Featured image URL from Cloudinary (optional)
 *   Used as a banner or visual representation of the organizational structure
 *
 * Note: This model provides narrative content about the organization structure,
 * while the Governance model provides the actual hierarchical data and charts.
 * This is more about explaining the structure, while Governance shows it.
 */
const organizationStructureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },
});

// ==================== EXPORTS ====================
// Create and export the OrganizationStructure model
module.exports = mongoose.model('OrganizationStructure', organizationStructureSchema);
