/**
 * DONATION SETTINGS MODEL
 *
 * Defines the DonationSettings schema for managing donation configuration and tax certificates.
 * This model stores all settings required for processing donations, generating tax receipts,
 * and managing payment methods. Used by the Razorpay integration and donation system.
 *
 * Schema contains:
 * - NGO information (name, address, PAN, 80G registration)
 * - Authorized signatory details for tax certificates
 * - Payment methods (UPI, bank transfer)
 * - QR code and payment URLs
 * - Tax-related notes and disclaimers
 */

// ==================== IMPORTS ====================
const mongoose = require('mongoose');

// ==================== SCHEMA DEFINITION ====================

/**
 * Donation Settings Schema
 *
 * This schema contains all configuration needed for donation processing
 * and tax certificate generation under Indian tax laws (Section 80G).
 */
const donationSettingsSchema = new mongoose.Schema(
  {
    // ==================== NGO INFORMATION ====================
    /**
     * ngoName: Full legal name of the NGO
     * Used on tax certificates and official documents
     */
    ngoName: { type: String, default: '', trim: true },

    /**
     * ngoAddress: Complete registered address of the NGO
     * Required for tax certificate validity
     */
    ngoAddress: { type: String, default: '', trim: true },

    /**
     * ngoPan: Permanent Account Number of the NGO
     * Required for tax exemption certificates
     */
    ngoPan: { type: String, default: '', trim: true },

    /**
     * eightyGRegistrationNumber: 80G registration number
     * Required for tax exemption under Section 80G of Income Tax Act
     */
    eightyGRegistrationNumber: { type: String, default: '', trim: true },

    // ==================== NOTIFICATION SETTINGS ====================
    /**
     * ngoNotificationEmail: Email for donation notifications
     * Where donation confirmations and alerts are sent
     */
    ngoNotificationEmail: { type: String, default: '', trim: true },

    // ==================== AUTHORIZED SIGNATORY ====================
    /**
     * authorizedSignatoryName: Name of authorized signatory
     * Person authorized to sign tax certificates
     */
    authorizedSignatoryName: { type: String, default: '', trim: true },

    /**
     * authorizedSignatureImageUrl: Digital signature image URL
     * Used for generating electronic tax certificates
     */
    authorizedSignatureImageUrl: { type: String, default: '', trim: true },

    // ==================== PAYMENT METHODS ====================
    /**
     * upiId: UPI ID for direct UPI payments
     * Format: merchant@paytm or similar
     */
    upiId: { type: String, default: '', trim: true },

    /**
     * Bank transfer details for manual donations
     */
    bankName: { type: String, default: '', trim: true },
    accountName: { type: String, default: '', trim: true },
    accountNumber: { type: String, default: '', trim: true },
    ifsc: { type: String, default: '', trim: true },
    branch: { type: String, default: '', trim: true },

    // ==================== PAYMENT VISUALS ====================
    /**
     * qrImageUrl: QR code image URL for UPI payments
     * Generated QR code that donors can scan
     */
    qrImageUrl: { type: String, default: '', trim: true },

    /**
     * paymentUrl: Direct payment URL (Razorpay or other gateway)
     * Link for online donation processing
     */
    paymentUrl: { type: String, default: '', trim: true },

    // ==================== TAX INFORMATION ====================
    /**
     * taxNote: Additional tax-related notes or disclaimers
     * Displayed on donation forms and receipts
     */
    taxNote: { type: String, default: '', trim: true }
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
// Create and export the DonationSettings model
module.exports = mongoose.model('DonationSettings', donationSettingsSchema);
