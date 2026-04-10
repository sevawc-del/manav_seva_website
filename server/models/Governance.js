// Governance Model
const mongoose = require('mongoose');

const hierarchyNodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  position: { type: String, required: true },
  experience: { type: String },
  image: { type: String },
  children: [this], // Recursive reference for hierarchy
});

const policyTierSchema = new mongoose.Schema(
  {
    code: { type: String, default: '' },
    title: { type: String, default: '' },
    content: { type: String, default: '' }
  },
  { _id: false }
);

const governanceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  hierarchy: [hierarchyNodeSchema], // Root level nodes of the organizational hierarchy
  needTitle: { type: String, default: '' },
  needContent: { type: String, default: '' },
  policyTitle: { type: String, default: '' },
  policyIntro: { type: String, default: '' },
  policyTiers: { type: [policyTierSchema], default: [] },
  // Legacy fields retained for backward compatibility.
  ethicsTitle: { type: String, default: '' },
  ethicsContent: { type: String, default: '' },
  ethicsPoints: { type: [String], default: [] }
});

module.exports = mongoose.model('Governance', governanceSchema);
