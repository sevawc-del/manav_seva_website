// ActivityPresence Model
const mongoose = require('mongoose');

const activityPresenceSchema = new mongoose.Schema({
  activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true },
  stateCode: { type: String, required: true },
  districtCode: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('ActivityPresence', activityPresenceSchema);
