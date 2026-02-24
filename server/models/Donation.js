const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    receiptNumber: { type: String, required: true, unique: true, index: true },
    donorName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    mobileNumber: { type: String, required: true, trim: true },
    pan: { type: String, required: true, trim: true, uppercase: true },
    amount: { type: Number, required: true, min: 1 },
    amountInPaise: { type: Number, required: true, min: 100 },
    currency: { type: String, default: 'INR' },
    razorpayOrderId: { type: String, required: true, unique: true, index: true },
    razorpayPaymentId: { type: String, required: true, unique: true, index: true },
    paymentMethod: { type: String, default: '' },
    paymentCapturedAt: { type: Date, required: true },
    webhookEventId: { type: String, default: '', index: true },
    certificateStatus: {
      type: String,
      enum: ['issued', 'failed'],
      default: 'issued'
    },
    certificateIssuedAt: { type: Date, required: true },
    certificateFileName: { type: String, default: '' },
    certificateError: { type: String, default: '' },
    ngoSnapshot: {
      ngoName: { type: String, default: '' },
      ngoAddress: { type: String, default: '' },
      ngoPan: { type: String, default: '' },
      eightyGRegistrationNumber: { type: String, default: '' },
      authorizedSignatoryName: { type: String, default: '' }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Donation', donationSchema);
