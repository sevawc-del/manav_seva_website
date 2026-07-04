/**
 * ACTIVITY CONTROLLER
 *
 * Handles CRUD operations for organizational activities and their geographic presence.
 * Activities represent programs and initiatives that can be implemented across
 * multiple geographic locations (states and districts). This controller manages
 * the relationship between activities and their implementation locations.
 *
 * Routes handled:
 * - GET /api/activities - Retrieve all activities
 * - GET /api/activities/:id/presence - Get activity with location data
 * - POST /api/activities - Create new activity with districts
 *
 * Dependencies:
 * - Activity model: Core activity information
 * - ActivityPresence model: Geographic implementation mapping
 */

// ==================== IMPORTS ====================
const Activity = require('../models/Activity');
const ActivityPresence = require('../models/ActivityPresence');

// ==================== CONTROLLER FUNCTIONS ====================

/**
 * GET ALL ACTIVITIES
 *
 * Retrieves all organizational activities sorted by creation date (newest first).
 * Used for displaying activity listings in admin panel and public pages.
 *
 * @route GET /api/activities
 * @access Public (for public display) / Admin (for management)
 * @returns {Array} List of all activities with full details
 */
const getActivities = async (req, res) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * GET ACTIVITY WITH PRESENCE DATA
 *
 * Retrieves a specific activity along with all its geographic presence records.
 * This shows where the activity is implemented across different locations.
 * Used for detailed activity views and geographic mapping.
 *
 * @route GET /api/activities/:id/presence
 * @access Admin
 * @param {string} id - Activity ID from URL parameters
 * @returns {Object} Activity object with presence array
 * @returns {404} If activity not found
 */
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

/**
 * CREATE NEW ACTIVITY WITH DISTRICTS
 *
 * Creates a new activity and optionally associates it with multiple geographic locations.
 * This is a compound operation that creates both the activity record and its
 * presence records in a single transaction-like operation.
 *
 * @route POST /api/activities
 * @access Admin
 * @param {Object} req.body
 * @param {string} req.body.name - Activity name (required)
 * @param {string} req.body.description - Activity description (required)
 * @param {Array} req.body.districts - Array of district objects with stateCode and districtCode
 * @returns {201} Created activity object
 * @returns {400} If required fields missing or invalid data
 *
 * Expected districts format:
 * [{ stateCode: "UP", districtCode: "GOR" }, { stateCode: "DL", districtCode: "ND" }]
 */
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

// ==================== EXPORTS ====================
module.exports = {
  getActivities,
  getActivityPresence,
  createActivity
};

