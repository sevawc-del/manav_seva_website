const mongoose = require('mongoose');

const reportAccessRequestSchema = new mongoose.Schema(
  {
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
      required: true
    },
    requesterName: { type: String, required: true, trim: true },
    requesterEmail: { type: String, required: true, trim: true, lowercase: true },
    requesterPhone: { type: String, trim: true, default: '' },
    organization: { type: String, trim: true, default: '' },
    purpose: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      required: true
    },
    reviewerNote: { type: String, trim: true, default: '' },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    accessToken: { type: String, required: true, unique: true, index: true },
    tokenExpiresAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReportAccessRequest', reportAccessRequestSchema);
