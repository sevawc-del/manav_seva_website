const AdminActivity = require('../models/AdminActivity');
const cloudinary = require('../config/cloudinary');
const fs = require('fs/promises');

const cleanupTempUpload = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Temp upload cleanup error:', error.message);
    }
  }
};

// Get all admin activities
const getAdminActivities = async (req, res) => {
  try {
    const activities = await AdminActivity.find({ isActive: true }).sort({ order: 1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
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
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Create admin activity (admin)
const createAdminActivity = async (req, res) => {
  try {
    const { name, slug, description, content, impactNumber, problem, action, result } = req.body;
    const order = Number.isFinite(Number(req.body.order)) ? Number(req.body.order) : 0;
    let imageUrl = req.body.image;

    if (req.file) {
      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: 'manav-seva/activities',
          resource_type: 'image'
        });
        imageUrl = uploadResult.secure_url;
        await cleanupTempUpload(req.file.path);
      } catch (uploadError) {
        await cleanupTempUpload(req.file.path);
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload image' });
      }
    }

    const parsedIsActive = req.body.isActive === undefined
      ? true
      : (req.body.isActive === 'true' || req.body.isActive === true);

    const activity = new AdminActivity({
      name,
      slug,
      description,
      problem: problem || '',
      action: action || '',
      result: result || '',
      content,
      image: imageUrl || '',
      impactNumber: impactNumber || '',
      order,
      isActive: parsedIsActive
    });
    await activity.save();
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const uploadAdminActivityImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Image file is required' });
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'manav-seva/activities',
      resource_type: 'image'
    });

    await cleanupTempUpload(req.file.path);
    return res.status(200).json({ imageUrl: result.secure_url });
  } catch (error) {
    await cleanupTempUpload(req.file.path);
    console.error('Activity inline image upload error:', error.message);
    return res.status(500).json({ message: 'Failed to upload image' });
  }
};

// Update admin activity (admin)
const updateAdminActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const existingActivity = await AdminActivity.findById(id);
    if (!existingActivity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    let imageUrl = req.body.image || existingActivity.image;
    if (req.file) {
      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: 'manav-seva/activities',
          resource_type: 'image'
        });
        imageUrl = uploadResult.secure_url;
        await cleanupTempUpload(req.file.path);
      } catch (uploadError) {
        await cleanupTempUpload(req.file.path);
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload image' });
      }
    }

    const isActive = req.body.isActive === undefined
      ? existingActivity.isActive
      : (req.body.isActive === 'true' || req.body.isActive === true);
    const order = Number.isFinite(Number(req.body.order)) ? Number(req.body.order) : existingActivity.order;
    const { name, slug, description, content, impactNumber, problem, action, result } = req.body;

    const activity = await AdminActivity.findByIdAndUpdate(
      id,
      {
        name,
        slug,
        description,
        problem: problem || '',
        action: action || '',
        result: result || '',
        content,
        image: imageUrl || '',
        impactNumber: impactNumber || '',
        isActive,
        order,
        updatedAt: Date.now()
      },
      { new: true }
    );

    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
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
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getAdminActivities,
  getAdminActivityBySlug,
  createAdminActivity,
  uploadAdminActivityImage,
  updateAdminActivity,
  deleteAdminActivity
};

