const mongoose = require('mongoose');

const donationSettingsSchema = new mongoose.Schema(
  {
    ngoName: { type: String, default: '', trim: true },
    ngoAddress: { type: String, default: '', trim: true },
    ngoPan: { type: String, default: '', trim: true },
    eightyGRegistrationNumber: { type: String, default: '', trim: true },
    ngoNotificationEmail: { type: String, default: '', trim: true },
    authorizedSignatoryName: { type: String, default: '', trim: true },
    authorizedSignatureImageUrl: { type: String, default: '', trim: true },
    upiId: { type: String, default: '', trim: true },
    bankName: { type: String, default: '', trim: true },
    accountName: { type: String, default: '', trim: true },
    accountNumber: { type: String, default: '', trim: true },
    ifsc: { type: String, default: '', trim: true },
    branch: { type: String, default: '', trim: true },
    qrImageUrl: { type: String, default: '', trim: true },
    paymentUrl: { type: String, default: '', trim: true },
    taxNote: { type: String, default: '', trim: true }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('DonationSettings', donationSettingsSchema);
