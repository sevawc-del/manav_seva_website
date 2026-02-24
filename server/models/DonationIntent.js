const mongoose = require('mongoose');

const donationIntentSchema = new mongoose.Schema(
  {
    donorName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    mobileNumber: { type: String, required: true, trim: true },
    pan: { type: String, required: true, trim: true, uppercase: true },
    amount: { type: Number, required: true, min: 1 },
    amountInPaise: { type: Number, required: true, min: 100 },
    currency: { type: String, default: 'INR' },
    razorpayOrderId: { type: String, required: true, unique: true, index: true },
    razorpayOrderReceipt: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'cancelled'],
      default: 'pending'
    },
    paidAt: { type: Date },
    lastWebhookEventId: { type: String, default: '' },
    failureReason: { type: String, default: '' }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('DonationIntent', donationIntentSchema);
