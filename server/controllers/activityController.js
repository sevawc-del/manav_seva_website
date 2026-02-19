const Activity = require('../models/Activity');
const ActivityPresence = require('../models/ActivityPresence');

// Get all activities
const getActivities = async (req, res) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get activity with presence data
const getActivityPresence = async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    const presence = await ActivityPresence.find({ activityId: id });
    res.json({
      activity,
      presence
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Create new activity with districts
const createActivity = async (req, res) => {
  try {
    const { name, description, districts } = req.body;

    // Create activity
    const activity = new Activity({
      name,
      description
    });
    const savedActivity = await activity.save();

    // Create activity presence records
    if (districts && districts.length > 0) {
      const presenceRecords = districts.map(district => ({
        activityId: savedActivity._id,
        stateCode: district.stateCode,
        districtCode: district.districtCode
      }));
      await ActivityPresence.insertMany(presenceRecords);
    }

    res.status(201).json(savedActivity);
  } catch (error) {
    res.status(400).json({ message: 'Invalid request data' });
  }
};

module.exports = {
  getActivities,
  getActivityPresence,
  createActivity
};

