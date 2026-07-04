/**
 * REPORT MODEL
 * 
 * Defines the Report schema for managing annual reports and organizational documents.
 * Reports can be public (anyone can access) or protected (requires request/approval).
 * 
 * Schema:
 * - title: Report name/title
 * - category: Report type (Annual, Financial, Impact, etc.)
 * - visibility: Public or protected access
 * - content: Report text content
 * - year: Financial/calendar year the report covers
 * - file: Report PDF/document URL from Cloudinary
 * - Cloudinary metadata: public_id, resource_type, format
 * - timestamps: Created and updated dates
 */

// ==================== IMPORTS ====================
const mongoose = require('mongoose');

// ==================== SCHEMA DEFINITION ====================

/**
 * Report Schema
 * 
 * Fields:
 * - title (String, required): Report title (e.g., "Annual Report 2024")
 * - category (String, required, default='General'): Report type/category
 *   Examples: "Annual", "Financial", "Impact", "Audit", "General"
 * - visibility (String, enum, required, default='public'): Access control
 *   - 'public': Anyone can view the report
 *   - 'protected': Requires approval or request to access
 * - content (String, required): Report text content (HTML or Markdown)
 * - year (Number, required): Year the report covers (e.g., 2024)
 * - file (String): URL to report PDF/document on Cloudinary
 * - filePublicId (String): Cloudinary public ID (used for deletion/updates)
 * - fileResourceType (String): Cloudinary resource type ('image', 'video', 'raw')
 * - fileFormat (String): File format (e.g., 'pdf', 'doc', 'docx')
 * - timestamps: createdAt and updatedAt (auto-managed by Mongoose)
 */
const reportSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true              // Report must have a title
    },
    category: { 
      type: String, 
      required: true,             // Category is required
      default: 'General',         // Default to 'General' if not specified
      trim: true                  // Remove whitespace
    },
    visibility: {
      type: String,
      enum: ['public', 'protected'],  // Only these two values allowed
      required: true,             // Visibility must be specified
      default: 'public'           // Public by default
    },
    content: { 
      type: String, 
      required: true              // Report content is required
    },
    year: { 
      type: Number, 
      required: true              // Year is required (e.g., 2024)
    },
    file: { 
      type: String                // Report document URL (optional)
    },
    /**
     * filePublicId (String)
     * 
     * Cloudinary public ID used to manage the file.
     * Needed to delete or update the file.
     * Example: "reports/annual_report_2024_abc123"
     */
    filePublicId: { 
      type: String, 
      trim: true, 
      default: ''                 // Empty if no file uploaded
    },
    /**
     * fileResourceType (String)
     * 
     * Type of resource stored on Cloudinary.
     * Examples: 'raw' (for PDFs), 'image', 'video'
     */
    fileResourceType: { 
      type: String, 
      trim: true, 
      default: ''                 // Empty if no file
    },
    /**
     * fileFormat (String)
     * 
     * File format (extension).
     * Examples: 'pdf', 'doc', 'docx', 'xlsx'
     */
    fileFormat: { 
      type: String, 
      trim: true, 
      default: ''                 // Empty if no file
    }
  },
  { 
    timestamps: true              // Auto-add createdAt and updatedAt
  }
);

// ==================== EXPORTS ====================
// Create and export the Report model
module.exports = mongoose.model('Report', reportSchema);
