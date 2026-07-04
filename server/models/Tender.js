/**
 * TENDER MODEL
 * 
 * Defines the Tender schema for managing procurement and contract tenders.
 * Tenders are public solicitations for goods, services, or contracts.
 * 
 * Schema:
 * - title: Name/title of the tender
 * - description: Detailed tender requirements and specifications
 * - deadline: Last date/time for tender submissions
 * - documents: Tender documents, terms, and related files
 */

// ==================== IMPORTS ====================
const mongoose = require('mongoose');

// ==================== SCHEMA DEFINITION ====================

/**
 * Tender Schema
 * 
 * Fields:
 * - title (String, required): Tender title/name
 * - description (String, required): Tender details, scope, and requirements
 * - deadline (Date, required): Last date/time for submissions
 * - documents (Array): URLs of tender documents (PDF, Word docs, etc.)
 */
const tenderSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true              // Every tender must have a title
  },
  description: { 
    type: String, 
    required: true              // Detailed description is required
  },
  deadline: { 
    type: Date, 
    required: true              // Submission deadline is required
  },
  documents: [
    { 
      type: String              // Array of document URLs from Cloudinary
    }
  ],
});

// ==================== EXPORTS ====================
// Create and export the Tender model
module.exports = mongoose.model('Tender', tenderSchema);
