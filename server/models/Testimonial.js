/**
 * TESTIMONIAL MODEL
 *
 * Defines the Testimonial schema for managing user testimonials and reviews.
 * Testimonials can be submitted via contact forms and require admin approval
 * before being displayed publicly on the website.
 *
 * Schema:
 * - quote: The testimonial text/quote
 * - name: Person's full name
 * - email: Contact email (for verification)
 * - designation: Job title/role (optional)
 * - location: City/location (optional)
 * - consentToPublish: User permission to publish
 * - status: Approval workflow status
 * - isPublic: Whether visible to public
 * - order: Display order priority
 * - isActive: Whether testimonial is active
 * - source: How testimonial was submitted
 * - timestamps: Created and updated dates
 */

// ==================== IMPORTS ====================
const mongoose = require('mongoose');

// ==================== SCHEMA DEFINITION ====================

/**
 * Testimonial Schema
 *
 * Fields:
 * - quote (String, required): The actual testimonial text/quote
 * - name (String, required): Full name of the person giving testimonial
 * - email (String, required): Email address for contact/verification
 * - designation (String, default=''): Job title or role (optional)
 * - location (String, default=''): City or location (optional)
 * - consentToPublish (Boolean, default=false): User consent for publication
 *   Must be true for testimonial to be considered for approval
 * - status (String, enum, default='pending'): Approval workflow status
 *   - 'pending': Awaiting admin review
 *   - 'approved': Approved for potential display
 *   - 'rejected': Not approved for display
 * - isPublic (Boolean, default=false): Whether currently displayed publicly
 *   Only approved testimonials can be made public
 * - order (Number, default=0): Display priority order (ascending)
 * - isActive (Boolean, default=true): Whether testimonial is active
 *   Inactive testimonials are hidden even if approved
 * - source (String, default='contact_form'): How testimonial was submitted
 *   e.g., 'contact_form', 'survey', 'event', etc.
 * - createdAt (Date, default=now): When testimonial was submitted
 * - updatedAt (Date, default=now): When testimonial was last modified
 */
const testimonialSchema = new mongoose.Schema({
  quote: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  designation: { type: String, default: '' },
  location: { type: String, default: '' },
  consentToPublish: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isPublic: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  source: { type: String, default: 'contact_form' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ==================== EXPORTS ====================
// Create and export the Testimonial model
module.exports = mongoose.model('Testimonial', testimonialSchema);
