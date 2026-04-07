const mongoose = require('mongoose');

const journeySchema = new mongoose.Schema({
  year: { type: Number, required: true },
  summary: { type: String, default: '' },
  milestones: [{ type: String, required: true }], // Array of milestone descriptions
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }, // For sorting
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Journey', journeySchema);
