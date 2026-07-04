/**
 * DONATION MODEL
 * 
 * Defines the Donation schema for tracking monetary donations to the organization.
 * Integrates with Razorpay payment gateway for secure payment processing.
 * Stores donor information, payment details, and tax certificate metadata.
 * 
 * Key Features:
 * - Complete donor and payment information for record-keeping
 * - Tax certificate generation (80G compliance for Indian NGOs)
 * - Razorpay integration for payment verification
 * - NGO snapshot for certificate generation
 * - Webhook tracking for payment confirmation
 * 
 * Schema includes:
 * - Donor details: name, email, phone, PAN (tax ID)
 * - Payment info: amount, currency, payment methods
 * - Razorpay IDs: order ID, payment ID for verification
 * - Certificate metadata: status, file name, issue date, errors
 * - NGO snapshot: organization details at time of donation
 */

// ==================== IMPORTS ====================
const mongoose = require('mongoose');

// ==================== SCHEMA DEFINITION ====================

/**
 * Donation Schema
 * 
 * Fields organized into groups:
 * 1. RECEIPT & IDENTIFICATION
 * 2. DONOR INFORMATION
 * 3. PAYMENT DETAILS
 * 4. RAZORPAY INTEGRATION
 * 5. TAX CERTIFICATE
 * 6. NGO INFORMATION SNAPSHOT
 * 7. TIMESTAMPS (added automatically)
 */
const donationSchema = new mongoose.Schema(
  {
    // ==================== 1. RECEIPT & IDENTIFICATION ====================
    
    /**
     * receiptNumber (String, required, unique, indexed)
     * 
     * Unique receipt identifier for the donation.
     * Example: "MKSV-2024-00001"
     * Used for tax certificate and financial records.
     * MUST be unique across all donations.
     */
    receiptNumber: { 
      type: String, 
      required: true,           // Every donation must have a receipt number
      unique: true,             // Each receipt number must be unique
      index: true               // Indexed for fast lookup by receipt
    },

    // ==================== 2. DONOR INFORMATION ====================
    
    /**
     * donorName (String, required)
     * 
     * Name of person/entity making the donation.
     * Trimmed to remove whitespace.
     * Used in tax certificate and receipt.
     */
    donorName: { 
      type: String, 
      required: true, 
      trim: true 
    },

    /**
     * email (String, required)
     * 
     * Donor's email address.
     * Trimmed and converted to lowercase for consistency.
     * Used to send receipt/certificate and for communications.
     */
    email: { 
      type: String, 
      required: true, 
      trim: true, 
      lowercase: true           // Normalize to lowercase
    },

    /**
     * mobileNumber (String, required)
     * 
     * Donor's phone number.
     * Trimmed but not validated (validation handled by controller).
     */
    mobileNumber: { 
      type: String, 
      required: true, 
      trim: true 
    },

    /**
     * pan (String, required)
     * 
     * PAN (Permanent Account Number) - Indian tax ID.
     * Required for tax certificate generation (80G).
     * Converted to uppercase for consistency.
     * Example: "AAAPA1234K"
     */
    pan: { 
      type: String, 
      required: true, 
      trim: true, 
      uppercase: true           // Normalize PAN to uppercase
    },

    // ==================== 3. PAYMENT DETAILS ====================
    
    /**
     * amount (Number, required)
     * 
     * Donation amount in rupees (INR).
     * Minimum value: 1 rupee (enforced by min validator).
     * Example: 100, 500, 1000, etc.
     */
    amount: { 
      type: Number, 
      required: true, 
      min: 1                    // Amount must be at least 1
    },

    /**
     * amountInPaise (Number, required)
     * 
     * Amount in paise (100 paise = 1 rupee).
     * Stored separately for Razorpay integration.
     * Minimum: 100 paise (1 rupee).
     * Example: For 100 rupees, this is 10000 paise
     */
    amountInPaise: { 
      type: Number, 
      required: true, 
      min: 100                  // Minimum 100 paise (1 rupee)
    },

    /**
     * currency (String, default='INR')
     * 
     * Currency code for the donation.
     * Currently only INR (Indian Rupees) is supported.
     */
    currency: { 
      type: String, 
      default: 'INR'            // Indian Rupees
    },

    // ==================== 4. RAZORPAY INTEGRATION ====================
    
    /**
     * razorpayOrderId (String, required, unique, indexed)
     * 
     * Order ID created in Razorpay payment gateway.
     * Returned when creating a payment link.
     * Used to verify payment was actually processed by Razorpay.
     * Example: "order_1Aa00000000001"
     */
    razorpayOrderId: { 
      type: String, 
      required: true, 
      unique: true,             // Each order has unique Razorpay ID
      index: true               // Indexed for fast lookup
    },

    /**
     * razorpayPaymentId (String, required, unique, indexed)
     * 
     * Payment ID returned after successful payment.
     * Proves payment was captured by Razorpay.
     * Used to verify and match webhooks.
     * Example: "pay_1Aa00000000001"
     */
    razorpayPaymentId: { 
      type: String, 
      required: true, 
      unique: true,             // Each payment has unique payment ID
      index: true               // Indexed for lookup
    },

    /**
     * paymentMethod (String, default='')
     * 
     * Method used to process payment.
     * Examples: "card", "netbanking", "upi", "wallet"
     */
    paymentMethod: { 
      type: String, 
      default: ''               // Empty if not captured
    },

    /**
     * paymentCapturedAt (Date, required)
     * 
     * Date/time when payment was successfully captured.
     * Provided by Razorpay webhook.
     */
    paymentCapturedAt: { 
      type: Date, 
      required: true            // Must be set when payment confirmed
    },

    // ==================== 5. WEBHOOK TRACKING ====================
    
    /**
     * webhookEventId (String, default='', indexed)
     * 
     * Razorpay webhook event ID that confirmed the payment.
     * Used to prevent duplicate processing of same webhook.
     * Example: "100000000000001"
     */
    webhookEventId: { 
      type: String, 
      default: '', 
      index: true               // Indexed to prevent duplicate webhooks
    },

    // ==================== 6. TAX CERTIFICATE ====================
    
    /**
     * certificateStatus (String, enum, default='issued')
     * 
     * Status of tax certificate generation.
     * Values:
     * - 'issued': Certificate successfully generated and stored
     * - 'failed': Certificate generation failed (check certificateError)
     */
    certificateStatus: {
      type: String,
      enum: ['issued', 'failed'],  // Only these two statuses allowed
      default: 'issued'
    },

    /**
     * certificateIssuedAt (Date, required)
     * 
     * Date when tax certificate was generated/issued.
     * Used to track certificate validity.
     */
    certificateIssuedAt: { 
      type: Date, 
      required: true            // Certificate date is always recorded
    },

    /**
     * certificateFileName (String, default='')
     * 
     * Name of generated PDF certificate file.
     * Stored on Cloudinary.
     * Example: "certificate_MKSV-2024-00001.pdf"
     */
    certificateFileName: { 
      type: String, 
      default: ''               // Empty if certificate generation failed
    },

    /**
     * certificateError (String, default='')
     * 
     * Error message if certificate generation failed.
     * Helps debug certificate generation issues.
     * Example: "PDF template not found" or "Font loading failed"
     */
    certificateError: { 
      type: String, 
      default: ''               // Empty if no error
    },

    // ==================== 7. NGO INFORMATION SNAPSHOT ====================
    
    /**
     * ngoSnapshot (Object)
     * 
     * Stores NGO organization details at the time of donation.
     * Used to generate accurate tax certificates.
     * Stored as snapshot so certificate is always accurate even if org details change.
     */
    ngoSnapshot: {
      /**
       * ngoName (String, default='')
       * Organization's legal name for the tax certificate
       * Example: "Manav Seva Foundation"
       */
      ngoName: { type: String, default: '' },
      
      /**
       * ngoAddress (String, default='')
       * Organization's registered address for certification
       */
      ngoAddress: { type: String, default: '' },
      
      /**
       * ngoPan (String, default='')
       * Organization's PAN (tax ID) for verification
       * Example: "AABCM5055K"
       */
      ngoPan: { type: String, default: '' },
      
      /**
       * eightyGRegistrationNumber (String, default='')
       * Registration number under Section 80G of Indian Income Tax Act
       * Needed for donors to claim tax deduction
       * Example: "80G/2023/12345"
       */
      eightyGRegistrationNumber: { type: String, default: '' },
      
      /**
       * authorizedSignatoryName (String, default='')
       * Name of authorized person signing the certificate
       * Typically the Executive Director or Finance Manager
       */
      authorizedSignatoryName: { type: String, default: '' }
    }
  },
  {
    /**
     * Mongoose Options
     * 
     * timestamps: true
     * - Automatically adds createdAt and updatedAt fields
     * - createdAt: Set when document is first created (never changes)
     * - updatedAt: Set on creation, updates every time document is modified
     */
    timestamps: true
  }
);

// ==================== EXPORTS ====================
// Create and export the Donation model
module.exports = mongoose.model('Donation', donationSchema);
