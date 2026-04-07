// Gallery Model
const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now },
  showOnHome: { type: Boolean, default: true }
});

module.exports = mongoose.model('Gallery', gallerySchema);
