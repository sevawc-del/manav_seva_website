// Report Model
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true, default: 'General', trim: true },
    visibility: {
      type: String,
      enum: ['public', 'protected'],
      required: true,
      default: 'public'
    },
    content: { type: String, required: true },
    year: { type: Number, required: true },
    file: { type: String },
    filePublicId: { type: String, trim: true, default: '' },
    fileResourceType: { type: String, trim: true, default: '' },
    fileFormat: { type: String, trim: true, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
