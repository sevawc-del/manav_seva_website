const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  requirements: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, enum: ['short-term', 'long-term', 'event-based'], required: true },
  commitment: { type: String },
  applicationDeadline: { type: Date },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Volunteer', volunteerSchema);
