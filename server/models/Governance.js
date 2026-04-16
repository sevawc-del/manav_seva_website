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

const orgChartGroupSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, default: '' },
    color: { type: String, default: '#dbeafe' },
    x: { type: Number, default: 40 },
    y: { type: Number, default: 40 },
    width: { type: Number, default: 360 },
    height: { type: Number, default: 220 }
  },
  { _id: false }
);

const orgChartNodeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, default: '' },
    position: { type: String, default: '' },
    experience: { type: String, default: '' },
    image: { type: String, default: '' },
    groupId: { type: String, default: '' },
    x: { type: Number, default: 80 },
    y: { type: Number, default: 80 }
  },
  { _id: false }
);

const orgChartEdgeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    relation: {
      type: String,
      enum: ['reports_to', 'advises', 'dotted_line', 'supports'],
      default: 'reports_to'
    },
    label: { type: String, default: '' }
  },
  { _id: false }
);

const orgChartSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    width: { type: Number, default: 1400 },
    height: { type: Number, default: 900 },
    groups: { type: [orgChartGroupSchema], default: [] },
    nodes: { type: [orgChartNodeSchema], default: [] },
    edges: { type: [orgChartEdgeSchema], default: [] }
  },
  { _id: false }
);

const governanceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  hierarchy: [hierarchyNodeSchema], // Root level nodes of the organizational hierarchy
  orgChart: { type: orgChartSchema, default: () => ({}) },
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
