// News Model
const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, index: true, sparse: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
  image: { type: String },
});

module.exports = mongoose.model('News', newsSchema);
