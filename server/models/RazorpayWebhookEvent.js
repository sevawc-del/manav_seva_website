const mongoose = require('mongoose');

const razorpayWebhookEventSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    eventType: { type: String, required: true },
    signature: { type: String, required: true },
    payloadHash: { type: String, required: true },
    status: {
      type: String,
      enum: ['received', 'processed', 'ignored', 'error'],
      default: 'received'
    },
    errorMessage: { type: String, default: '' },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    processedAt: { type: Date },
    rawPayload: { type: Object, required: true }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('RazorpayWebhookEvent', razorpayWebhookEventSchema);
