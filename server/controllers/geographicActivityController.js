const GeographicActivity = require('../models/GeographicActivity');
const GeographicActivityPresence = require('../models/GeographicActivityPresence');

// Get GeographicActivities
const getGeographicActivities = async (req, res) => {
  try {
    const activities = await GeographicActivity.find();
    const activitiesWithDistricts = await Promise.all(
      activities.map(async (activity) => {
        const presence = await GeographicActivityPresence.find({ activityId: activity._id });
        return {
          ...activity.toObject(),
          districts: presence.map(p => ({ stateCode: p.stateCode, districtCode: p.districtCode }))
        };
      })
    );
    res.json(activitiesWithDistricts);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get GeographicActivity Presence
const getGeographicActivityPresence = async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await GeographicActivity.findById(id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    const presence = await GeographicActivityPresence.find({ activityId: id });
    res.json({ activity, presence });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Create GeographicActivity
const createGeographicActivity = async (req, res) => {
  try {
    const { name, description, districts } = req.body;
    const activity = new GeographicActivity({ name, description });
    await activity.save();

    const presenceEntries = districts.map(d => ({
      activityId: activity._id,
      stateCode: d.stateCode,
      districtCode: d.districtCode,
    }));
    await GeographicActivityPresence.insertMany(presenceEntries);

    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update GeographicActivity
const updateGeographicActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, districts } = req.body;

    // Update activity
    const activity = await GeographicActivity.findByIdAndUpdate(id, { name, description }, { new: true });
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Get current presence
    const currentPresence = await GeographicActivityPresence.find({ activityId: id });

    // Convert districts to state-district pairs
    const newDistricts = districts.map(d => `${d.stateCode}-${d.districtCode}`);
    const currentDistricts = currentPresence.map(p => `${p.stateCode}-${p.districtCode}`);

    // Find districts to add and remove
    const districtsToAdd = districts.filter(d => !currentDistricts.includes(`${d.stateCode}-${d.districtCode}`));
    const districtsToRemove = currentPresence.filter(p => !newDistricts.includes(`${p.stateCode}-${p.districtCode}`));

    // Add new districts
    if (districtsToAdd.length > 0) {
      const presenceEntries = districtsToAdd.map(d => ({
        activityId: id,
        stateCode: d.stateCode,
        districtCode: d.districtCode,
      }));
      await GeographicActivityPresence.insertMany(presenceEntries);
    }

    // Remove old districts
    if (districtsToRemove.length > 0) {
      const idsToRemove = districtsToRemove.map(p => p._id);
      await GeographicActivityPresence.deleteMany({ _id: { $in: idsToRemove } });
    }

    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete GeographicActivity
const deleteGeographicActivity = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete associated presence entries first
    await GeographicActivityPresence.deleteMany({ activityId: id });

    // Delete the activity
    const activity = await GeographicActivity.findByIdAndDelete(id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { getGeographicActivities, getGeographicActivityPresence, createGeographicActivity, updateGeographicActivity, deleteGeographicActivity };

