// AboutUs Model
const mongoose = require('mongoose');

const aboutUsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },
  mission: { type: String, default: '' },
  vision: { type: String, default: '' },
});

module.exports = mongoose.model('AboutUs', aboutUsSchema);
