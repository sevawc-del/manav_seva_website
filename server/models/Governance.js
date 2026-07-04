/**
 * GOVERNANCE MODEL
 *
 * Defines the comprehensive Governance schema for managing organizational structure and governance information.
 * This model handles the organizational hierarchy, interactive org charts, governance policies,
 * and ethical guidelines. It's used to display the organization's structure and governance
 * framework on the website.
 *
 * Schema contains:
 * - title: Page title for governance section
 * - hierarchy: Traditional organizational hierarchy (tree structure)
 * - orgChart: Interactive organizational chart with nodes, edges, and groups
 * - needTitle/Content: Organizational needs and requirements
 * - policyTitle/Intro/Tiers: Governance policies organized by tiers
 * - ethicsTitle/Content/Points: Ethical guidelines and principles
 */

// ==================== IMPORTS ====================
const mongoose = require('mongoose');

// ==================== SUB-SCHEMAS ====================

/**
 * Hierarchy Node Schema
 * Represents a node in the organizational hierarchy tree
 * Supports recursive structure for nested reporting relationships
 */
const hierarchyNodeSchema = new mongoose.Schema({
  id: { type: String, required: true },           // Unique identifier for the node
  name: { type: String, required: true },         // Person's full name
  position: { type: String, required: true },     // Job title/position
  experience: { type: String },                   // Years of experience or background
  image: { type: String },                        // Profile photo URL
  children: [this],                               // Recursive reference for subordinates
});

/**
 * Policy Tier Schema
 * Represents different levels/tiers of governance policies
 * Each tier can have its own title and content
 */
const policyTierSchema = new mongoose.Schema(
  {
    code: { type: String, default: '' },          // Policy tier code (e.g., 'tier1', 'executive')
    title: { type: String, default: '' },         // Policy tier title
    content: { type: String, default: '' }        // Policy content (HTML/markdown)
  },
  { _id: false }                                  // No separate _id for subdocuments
);

/**
 * Org Chart Group Schema
 * Represents visual groups/clusters in the organizational chart
 * Used for styling and layout purposes
 */
const orgChartGroupSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },         // Unique group identifier
    name: { type: String, default: '' },          // Group display name
    color: { type: String, default: '#dbeafe' },  // Background color (hex code)
    x: { type: Number, default: 40 },             // X position on canvas
    y: { type: Number, default: 40 },             // Y position on canvas
    width: { type: Number, default: 360 },        // Group width
    height: { type: Number, default: 220 }        // Group height
  },
  { _id: false }
);

/**
 * Org Chart Node Schema
 * Represents an individual in the interactive organizational chart
 * Contains position, styling, and relationship information
 */
const orgChartNodeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },         // Unique node identifier
    name: { type: String, default: '' },          // Person's full name
    position: { type: String, default: '' },      // Job title
    experience: { type: String, default: '' },    // Experience/background
    image: { type: String, default: '' },         // Profile photo URL
    groupId: { type: String, default: '' },       // Associated group ID
    x: { type: Number, default: 80 },             // X coordinate on canvas
    y: { type: Number, default: 80 }              // Y coordinate on canvas
  },
  { _id: false }
);

/**
 * Org Chart Edge Schema
 * Represents relationships/connections between nodes in the org chart
 * Defines reporting lines, advisory relationships, etc.
 */
const orgChartEdgeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },         // Unique edge identifier
    source: { type: String, required: true },     // Source node ID
    target: { type: String, required: true },     // Target node ID
    relation: {
      type: String,
      enum: ['reports_to', 'advises', 'dotted_line', 'supports'],
      default: 'reports_to'                       // Type of relationship
    },
    label: { type: String, default: '' }          // Optional relationship label
  },
  { _id: false }
);

/**
 * Org Chart Schema
 * Container for the complete interactive organizational chart
 * Includes canvas dimensions, nodes, edges, and visual groups
 */
const orgChartSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },   // Whether org chart is displayed
    width: { type: Number, default: 1400 },       // Canvas width in pixels
    height: { type: Number, default: 900 },       // Canvas height in pixels
    groups: { type: [orgChartGroupSchema], default: [] }, // Visual grouping elements
    nodes: { type: [orgChartNodeSchema], default: [] },   // Individual positions/people
    edges: { type: [orgChartEdgeSchema], default: [] }    // Relationships/connections
  },
  { _id: false }
);

// ==================== MAIN GOVERNANCE SCHEMA ====================

/**
 * Governance Schema
 *
 * This schema combines traditional hierarchy, interactive charts,
 * and governance policies into a comprehensive governance structure.
 */
const governanceSchema = new mongoose.Schema({
  // ==================== BASIC INFORMATION ====================
  title: { type: String, required: true },        // Page title for governance section

  // ==================== ORGANIZATIONAL HIERARCHY ====================
  hierarchy: [hierarchyNodeSchema],               // Root level nodes of org hierarchy
                                                  // Children create nested tree structure

  // ==================== INTERACTIVE ORG CHART ====================
  orgChart: { type: orgChartSchema, default: () => ({}) }, // Interactive organizational chart

  // ==================== ORGANIZATIONAL NEEDS ====================
  needTitle: { type: String, default: '' },       // Title for organizational needs section
  needContent: { type: String, default: '' },     // Content describing organizational needs

  // ==================== GOVERNANCE POLICIES ====================
  policyTitle: { type: String, default: '' },     // Title for policies section
  policyIntro: { type: String, default: '' },     // Introduction to governance policies
  policyTiers: { type: [policyTierSchema], default: [] }, // Policies organized by tiers

  // ==================== LEGACY ETHICS FIELDS ====================
  // Retained for backward compatibility with existing data
  ethicsTitle: { type: String, default: '' },     // Legacy ethics section title
  ethicsContent: { type: String, default: '' },   // Legacy ethics content
  ethicsPoints: { type: [String], default: [] }   // Legacy ethics bullet points
});

// ==================== EXPORTS ====================
// Create and export the Governance model
module.exports = mongoose.model('Governance', governanceSchema);
