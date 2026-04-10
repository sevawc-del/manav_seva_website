// GeographicActivity Model
const mongoose = require('mongoose');

const geographicActivitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('GeographicActivity', geographicActivitySchema);
