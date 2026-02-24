const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    logo: { type: String, required: true, trim: true },
    website: { type: String, default: '', trim: true },
    tier: {
      type: String,
      enum: ['strategic', 'program', 'community', 'other'],
      default: 'community'
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Sponsor', sponsorSchema);
