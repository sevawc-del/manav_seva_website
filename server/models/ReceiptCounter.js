/**
 * RECEIPT COUNTER MODEL
 *
 * Defines the ReceiptCounter schema for generating sequential receipt numbers.
 * This model implements an auto-incrementing counter system for tax receipt numbering.
 * Each successful donation gets a unique sequential receipt number for tax purposes,
 * ensuring proper 80G certificate numbering as required by Indian tax laws.
 *
 * Schema:
 * - key: Identifier for the counter type (e.g., 'donation_receipt')
 * - seq: Current sequence number (auto-increments)
 * - timestamps: Created and updated dates
 */

// ==================== IMPORTS ====================
const mongoose = require('mongoose');

// ==================== SCHEMA DEFINITION ====================

/**
 * Receipt Counter Schema
 *
 * This schema provides atomic auto-incrementing counters for receipt numbering.
 * Used to generate unique, sequential receipt numbers for tax certificates.
 */
const receiptCounterSchema = new mongoose.Schema(
  {
    /**
     * key: Unique identifier for the counter type
     * Examples:
     * - 'donation_receipt': For donation tax receipts
     * - 'event_receipt': For event-related receipts
     * Allows multiple counter types if needed in the future
     */
    key: { type: String, required: true, unique: true },

    /**
     * seq: Current sequence number for this counter
     * Auto-increments with each new receipt generation
     * Starts at 0, first receipt will be 1
     */
    seq: { type: Number, default: 0 }
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
// Create and export the ReceiptCounter model
module.exports = mongoose.model('ReceiptCounter', receiptCounterSchema);
