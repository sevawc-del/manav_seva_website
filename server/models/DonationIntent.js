/**
 * DONATION INTENT MODEL
 *
 * Defines the DonationIntent schema for managing donation payment intents through Razorpay.
 * This model tracks the lifecycle of donation transactions from creation to completion.
 * Each intent represents a donor's attempt to make a payment, with status tracking
 * and webhook integration for payment confirmation.
 *
 * Schema:
 * - donorName: Full name of the donor
 * - email: Donor email address
 * - mobileNumber: Donor mobile number
 * - pan: Permanent Account Number (for tax purposes)
 * - amount: Donation amount in rupees
 * - amountInPaise: Amount in paisa (Razorpay format)
 * - currency: Currency code (default INR)
 * - razorpayOrderId: Unique Razorpay order identifier
 * - razorpayOrderReceipt: Receipt identifier
 * - status: Payment status (pending, paid, failed, cancelled)
 * - paidAt: Timestamp when payment was completed
 * - lastWebhookEventId: Last webhook event processed
 * - failureReason: Reason for payment failure
 * - timestamps: Created and updated dates
 */

// ==================== IMPORTS ====================
const mongoose = require('mongoose');

// ==================== SCHEMA DEFINITION ====================

/**
 * Donation Intent Schema
 *
 * This schema tracks donation payment attempts and their lifecycle.
 * Each document represents one donation transaction attempt.
 */
const donationIntentSchema = new mongoose.Schema(
  {
    // ==================== DONOR INFORMATION ====================
    /**
     * donorName: Full name of the person making the donation
     * Required for tax certificate generation
     */
    donorName: { type: String, required: true, trim: true },

    /**
     * email: Donor email address
     * Used for confirmation emails and receipt delivery
     */
    email: { type: String, required: true, trim: true, lowercase: true },

    /**
     * mobileNumber: Donor mobile phone number
     * Used for payment verification and contact
     */
    mobileNumber: { type: String, required: true, trim: true },

    /**
     * pan: Permanent Account Number (Indian tax ID)
     * Required for 80G tax exemption certificates
     */
    pan: { type: String, required: true, trim: true, uppercase: true },

    // ==================== PAYMENT AMOUNT ====================
    /**
     * amount: Donation amount in Indian Rupees
     * Human-readable amount (e.g., 1000 for ₹1000)
     */
    amount: { type: Number, required: true, min: 1 },

    /**
     * amountInPaise: Amount in paisa (smallest currency unit)
     * Razorpay requires amounts in paisa (e.g., 100000 for ₹1000)
     */
    amountInPaise: { type: Number, required: true, min: 100 },

    /**
     * currency: Currency code for the transaction
     * Default: 'INR' (Indian Rupee)
     */
    currency: { type: String, default: 'INR' },

    // ==================== RAZORPAY INTEGRATION ====================
    /**
     * razorpayOrderId: Unique order ID from Razorpay
     * Format: order_XXXXXXXXXXXXXXXXXXXXXX
     * Used to track and verify payments
     */
    razorpayOrderId: { type: String, required: true, unique: true, index: true },

    /**
     * razorpayOrderReceipt: Receipt identifier from Razorpay
     * Used for transaction tracking and receipts
     */
    razorpayOrderReceipt: { type: String, required: true },

    // ==================== PAYMENT STATUS ====================
    /**
     * status: Current status of the donation payment
     * - 'pending': Order created, payment not completed
     * - 'paid': Payment successfully completed
     * - 'failed': Payment failed or rejected
     * - 'cancelled': Order was cancelled by user or system
     */
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'cancelled'],
      default: 'pending'
    },

    /**
     * paidAt: Timestamp when payment was successfully completed
     * Set when status changes to 'paid'
     */
    paidAt: { type: Date },

    /**
     * lastWebhookEventId: ID of the last webhook event processed
     * Used to prevent duplicate webhook processing
     */
    lastWebhookEventId: { type: String, default: '' },

    /**
     * failureReason: Description of why payment failed
     * Populated when status is 'failed'
     */
    failureReason: { type: String, default: '' }
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
// Create and export the DonationIntent model
module.exports = mongoose.model('DonationIntent', donationIntentSchema);
