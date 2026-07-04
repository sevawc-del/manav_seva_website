/**
 * RAZORPAY WEBHOOK EVENT MODEL
 *
 * Defines the RazorpayWebhookEvent schema for logging and tracking webhook events from Razorpay.
 * Razorpay sends webhook notifications for payment events (success, failure, etc.).
 * This model ensures webhook idempotency (no duplicate processing) and provides
 * an audit trail for all payment-related events.
 *
 * Schema:
 * - eventId: Unique Razorpay event identifier
 * - eventType: Type of webhook event (payment.captured, etc.)
 * - signature: Webhook signature for verification
 * - payloadHash: Hash of payload for duplicate detection
 * - status: Processing status of the webhook
 * - errorMessage: Error details if processing failed
 * - razorpayOrderId: Associated order ID
 * - razorpayPaymentId: Associated payment ID
 * - processedAt: When webhook was successfully processed
 * - rawPayload: Complete webhook payload data
 * - timestamps: Created and updated dates
 */

// ==================== IMPORTS ====================
const mongoose = require('mongoose');

// ==================== SCHEMA DEFINITION ====================

/**
 * Razorpay Webhook Event Schema
 *
 * This schema logs all webhook events received from Razorpay to ensure
 * reliable payment processing and prevent duplicate event handling.
 */
const razorpayWebhookEventSchema = new mongoose.Schema(
  {
    // ==================== WEBHOOK IDENTIFICATION ====================
    /**
     * eventId: Unique identifier for the webhook event from Razorpay
     * Format: evt_XXXXXXXXXXXXXXXXXXXXXX
     * Used to prevent duplicate processing of the same event
     */
    eventId: { type: String, required: true, unique: true, index: true },

    /**
     * eventType: Type of webhook event received
     * Examples: 'payment.captured', 'payment.failed', 'order.paid'
     */
    eventType: { type: String, required: true },

    /**
     * signature: Razorpay webhook signature for verification
     * Used to verify that the webhook actually came from Razorpay
     */
    signature: { type: String, required: true },

    /**
     * payloadHash: SHA256 hash of the webhook payload
     * Used for duplicate detection and data integrity verification
     */
    payloadHash: { type: String, required: true },

    // ==================== PROCESSING STATUS ====================
    /**
     * status: Current processing status of the webhook event
     * - 'received': Webhook received but not yet processed
     * - 'processed': Successfully processed and actions taken
     * - 'ignored': Event type not relevant or already handled
     * - 'error': Processing failed due to an error
     */
    status: {
      type: String,
      enum: ['received', 'processed', 'ignored', 'error'],
      default: 'received'
    },

    /**
     * errorMessage: Error details if webhook processing failed
     * Contains stack traces or error descriptions for debugging
     */
    errorMessage: { type: String, default: '' },

    // ==================== PAYMENT REFERENCES ====================
    /**
     * razorpayOrderId: Associated Razorpay order ID
     * Links webhook to the original donation intent
     * Format: order_XXXXXXXXXXXXXXXXXXXXXX
     */
    razorpayOrderId: { type: String, default: '' },

    /**
     * razorpayPaymentId: Associated Razorpay payment ID
     * Populated when payment is captured
     * Format: pay_XXXXXXXXXXXXXXXXXXXXXX
     */
    razorpayPaymentId: { type: String, default: '' },

    /**
     * processedAt: Timestamp when webhook was successfully processed
     * Set when status changes to 'processed'
     */
    processedAt: { type: Date },

    // ==================== RAW DATA ====================
    /**
     * rawPayload: Complete webhook payload received from Razorpay
     * Stored as JSON object for audit and debugging purposes
     * Contains all event data sent by Razorpay
     */
    rawPayload: { type: Object, required: true }
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
// Create and export the RazorpayWebhookEvent model
module.exports = mongoose.model('RazorpayWebhookEvent', razorpayWebhookEventSchema);
