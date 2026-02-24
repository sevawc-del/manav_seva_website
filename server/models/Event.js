const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, index: true, sparse: true },
  description: { type: String, default: '' },
  content: { type: String, required: true },
  image: { type: String, default: '' },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date },
  location: { type: String, default: '' },
  isOnline: { type: Boolean, default: false },
  registrationLink: { type: String, default: '' },
  isPublished: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
