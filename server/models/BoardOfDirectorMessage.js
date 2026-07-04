/**
 * BOARD OF DIRECTOR MESSAGE MODEL
 *
 * Defines the BoardOfDirectorMessage schema for managing messages from board of directors.
 * Board members can share their vision, guidance, and messages to stakeholders.
 * These messages are displayed on the website to show leadership perspectives
 * and organizational direction.
 *
 * Schema:
 * - name: Director's full name
 * - position: Board position/title
 * - message: The director's message content
 * - image: Director's photo URL (optional)
 */

// ==================== IMPORTS ====================
const mongoose = require('mongoose');

// ==================== SCHEMA DEFINITION ====================

/**
 * Board of Director Message Schema
 *
 * Fields:
 * - name (String, required): Full name of the board director
 *   e.g., "Dr. Rajesh Kumar", "Ms. Priya Sharma"
 * - position (String, required): Board position or title
 *   e.g., "Chairperson", "Vice Chairperson", "Board Member"
 * - message (String, required): The director's message content (rich text/HTML)
 *   Can contain vision statements, guidance, or organizational updates
 * - image (String): Profile photo URL from Cloudinary (optional)
 *   Used for visual representation alongside the message
 *
 * Note: Unlike Message model, this is specifically for board of directors
 * and may have different display formatting or prominence on the website.
 */
const boardOfDirectorMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  message: { type: String, required: true },
  image: { type: String },
});

// ==================== EXPORTS ====================
// Create and export the BoardOfDirectorMessage model
module.exports = mongoose.model('BoardOfDirectorMessage', boardOfDirectorMessageSchema);
