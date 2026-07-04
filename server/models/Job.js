/**
 * JOB MODEL
 * 
 * Defines the Job schema for managing job postings and career opportunities.
 * Job postings are displayed on the Careers page of the website.
 * 
 * Schema:
 * - title: Job title/position
 * - description: Job responsibilities and overview
 * - requirements: Required skills, experience, qualifications
 * - location: Job location/work site
 * - type: Employment type (full-time, part-time, contract)
 * - salary: Salary/compensation (optional)
 * - applicationDeadline: Last date to apply
 * - isActive: Toggle job visibility
 * - timestamps: Created and updated dates
 */

// ==================== IMPORTS ====================
const mongoose = require('mongoose');

// ==================== SCHEMA DEFINITION ====================

/**
 * Job Schema
 * 
 * Fields:
 * - title (String, required): Position title (e.g., "Program Manager")
 * - description (String, required): Job responsibilities and overview
 * - requirements (String, required): Required skills, experience, qualifications
 * - location (String, required): Job location/work site
 * - type (String, enum, required): Employment type
 *   Options: 'full-time', 'part-time', 'contract'
 * - salary (String): Salary/compensation range (optional)
 *   Example: "₹50,000 - ₹100,000 per month"
 * - applicationDeadline (Date): Last date to submit application
 * - isActive (Boolean, default=true): Show on careers page
 * - createdAt (Date, default=now): When job was posted
 * - updatedAt (Date, default=now): When job was last modified
 */
const jobSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true              // Job must have a title
  },
  description: { 
    type: String, 
    required: true              // Job description/overview is required
  },
  requirements: { 
    type: String, 
    required: true              // Required qualifications must be listed
  },
  location: { 
    type: String, 
    required: true              // Job location is required
  },
  type: { 
    type: String, 
    enum: ['full-time', 'part-time', 'contract'],  // Only these types allowed
    required: true              // Employment type is required
  },
  salary: { 
    type: String                // Salary/compensation (optional)
  },
  applicationDeadline: { 
    type: Date                  // Application deadline (optional)
  },
  isActive: { 
    type: Boolean, 
    default: true               // Jobs are active/visible by default
  },
  createdAt: { 
    type: Date, 
    default: Date.now           // Auto-set when job is posted
  },
  updatedAt: { 
    type: Date, 
    default: Date.now           // Should be updated when job is modified
  }
});

// ==================== EXPORTS ====================
// Create and export the Job model
module.exports = mongoose.model('Job', jobSchema);
