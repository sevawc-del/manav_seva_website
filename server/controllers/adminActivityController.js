const AdminActivity = require('../models/AdminActivity');

// Get all admin activities
const getAdminActivities = async (req, res) => {
  try {
    const activities = await AdminActivity.find({ isActive: true }).sort({ order: 1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get admin activity by slug
const getAdminActivityBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const activity = await AdminActivity.findOne({ slug, isActive: true });
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create admin activity (admin)
const createAdminActivity = async (req, res) => {
  try {
    const { name, slug, description, content, image, order } = req.body;
    const activity = new AdminActivity({
      name,
      slug,
      description,
      content,
      image,
      order: order || 0
    });
    await activity.save();
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update admin activity (admin)
const updateAdminActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, content, image, isActive, order } = req.body;
    const activity = await AdminActivity.findByIdAndUpdate(
      id,
      { name, slug, description, content, image, isActive, order, updatedAt: Date.now() },
      { new: true }
    );
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete admin activity (admin)
const deleteAdminActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await AdminActivity.findByIdAndDelete(id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAdminActivities, getAdminActivityBySlug, createAdminActivity, updateAdminActivity, deleteAdminActivity };
