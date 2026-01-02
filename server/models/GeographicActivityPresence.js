// GeographicActivityPresence Model
const mongoose = require('mongoose');

const geographicActivityPresenceSchema = new mongoose.Schema({
  activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'GeographicActivity', required: true },
  stateCode: { type: String, required: true },
  districtCode: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('GeographicActivityPresence', geographicActivityPresenceSchema);
