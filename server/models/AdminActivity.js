const mongoose = require('mongoose');

const adminActivitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, // e.g., 'health-campaigns'
  description: { type: String, required: true },
  content: { type: String, required: true }, // Rich text content
  image: { type: String }, // Image URL
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }, // For sorting
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdminActivity', adminActivitySchema);
