const mongoose = require('mongoose');

const sliderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  image: { type: String, required: true }, // Image URL from Cloudinary
  order: { type: Number, default: 0 }, // For sorting
  isActive: { type: Boolean, default: true },
  buttonText: { type: String, default: 'Learn More' },
  buttonLink: { type: String, default: '/about' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Slider', sliderSchema);
