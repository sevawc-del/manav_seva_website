/**
 * REPORT ACCESS REQUEST MODEL
 *
 * Defines the ReportAccessRequest schema for managing access requests to restricted reports.
 * Reports may be marked as private or require approval for access. This model tracks
 * requests from external users (researchers, partners, etc.) to view restricted reports,
 * including approval workflow and temporary access tokens.
 *
 * Schema:
 * - reportId: Reference to the Report document
 * - requesterName: Full name of the person requesting access
 * - requesterEmail: Email address for notifications
 * - requesterPhone: Phone number (optional)
 * - organization: Organization affiliation (optional)
 * - purpose: Reason for requesting access
 * - status: Request status (pending, approved, rejected)
 * - reviewerNote: Comments from the reviewer
 * - reviewedAt: When the request was reviewed
 * - reviewedBy: Admin user who reviewed the request
 * - accessToken: Temporary access token for approved requests
 * - tokenExpiresAt: When the access token expires
 * - timestamps: Created and updated dates
 */

// ==================== IMPORTS ====================
const mongoose = require('mongoose');

// ==================== SCHEMA DEFINITION ====================

/**
 * Report Access Request Schema
 *
 * This schema manages the workflow for requesting and granting access
 * to restricted reports. It includes approval process and temporary access tokens.
 */
const reportAccessRequestSchema = new mongoose.Schema(
  {
    // ==================== REPORT REFERENCE ====================
    /**
     * reportId: Reference to the Report document being requested
     * Links this access request to a specific report
     */
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
      required: true
    },

    // ==================== REQUESTER INFORMATION ====================
    /**
     * requesterName: Full name of the person requesting access
     * Required for identification and communication
     */
    requesterName: { type: String, required: true, trim: true },

    /**
     * requesterEmail: Email address for notifications and communication
     * Used to send approval/rejection notifications and access links
     */
    requesterEmail: { type: String, required: true, trim: true, lowercase: true },

    /**
     * requesterPhone: Phone number for contact (optional)
     * Additional contact method for urgent communications
     */
    requesterPhone: { type: String, trim: true, default: '' },

    /**
     * organization: Organization or institution affiliation (optional)
     * Helps assess the legitimacy and context of the request
     */
    organization: { type: String, trim: true, default: '' },

    /**
     * purpose: Reason for requesting access to the report
     * Required to understand the context and legitimacy of the request
     */
    purpose: { type: String, required: true, trim: true },

    // ==================== APPROVAL WORKFLOW ====================
    /**
     * status: Current status of the access request
     * - 'pending': Awaiting admin review
     * - 'approved': Access granted, token generated
     * - 'rejected': Access denied
     */
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      required: true
    },

    /**
     * reviewerNote: Comments or notes from the admin reviewer
     * Explains the decision or additional conditions
     */
    reviewerNote: { type: String, trim: true, default: '' },

    /**
     * reviewedAt: Timestamp when the request was reviewed
     * Set when status changes from 'pending'
     */
    reviewedAt: { type: Date, default: null },

    /**
     * reviewedBy: Reference to the admin User who reviewed the request
     * Tracks accountability for approval decisions
     */
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // ==================== ACCESS TOKEN ====================
    /**
     * accessToken: Unique token for temporary access to the report
     * Generated when request is approved, allows direct report access
     * without requiring user authentication
     */
    accessToken: { type: String, required: true, unique: true, index: true },

    /**
     * tokenExpiresAt: Expiration date for the access token
     * After this date, the token becomes invalid and access is revoked
     */
    tokenExpiresAt: { type: Date, default: null }
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
// Create and export the ReportAccessRequest model
module.exports = mongoose.model('ReportAccessRequest', reportAccessRequestSchema);
