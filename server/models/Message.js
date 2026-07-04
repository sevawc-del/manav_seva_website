/**
 * MESSAGE MODEL
 *
 * Defines the Message schema for managing leadership messages and statements.
 * Messages are from key organizational leaders (board members, executives)
 * and are displayed on the website to share vision, updates, and guidance.
 *
 * Schema:
 * - name: Leader's full name
 * - position: Job title/role
 * - displayOrder: Order of appearance
 * - message: The message content
 * - image: Leader's photo URL (optional)
 */

// ==================== IMPORTS ====================
const mongoose = require('mongoose');

// ==================== SCHEMA DEFINITION ====================

/**
 * Message Schema
 *
 * Fields:
 * - name (String, required): Full name of the leader/author
 *   e.g., "John Smith", "Dr. Sarah Johnson"
 * - position (String, required): Job title or role
 *   e.g., "Executive Director", "Board Chairperson", "Program Manager"
 * - displayOrder (Number, required): Order of appearance on the page
 *   Lower numbers appear first (ascending order)
 * - message (String, required): The actual message content (rich text/HTML)
 *   Can contain the leader's vision, updates, or guidance
 * - image (String): Profile photo URL from Cloudinary (optional)
 *   If not provided, a default avatar or no image may be shown
 */
const messageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  displayOrder: { type: Number, required: true },
  message: { type: String, required: true },
  image: { type: String },
});

// ==================== EXPORTS ====================
// Create and export the Message model
module.exports = mongoose.model('Message', messageSchema);
