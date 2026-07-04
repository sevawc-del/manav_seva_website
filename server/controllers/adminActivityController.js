/**
 * ADMIN ACTIVITY CONTROLLER
 *
 * Handles CRUD operations for administrative activities and campaigns.
 * Admin activities represent special programs managed by the administrative team,
 * often following a Problem-Action-Result (PAR) framework for impact measurement.
 * Supports image uploads to Cloudinary and slug-based routing.
 *
 * Routes handled:
 * - GET /api/admin-activities - Get all active admin activities
 * - GET /api/admin-activities/:slug - Get activity by slug
 * - POST /api/admin-activities - Create new admin activity
 * - PUT /api/admin-activities/:id - Update existing activity
 * - DELETE /api/admin-activities/:id - Delete activity
 * - POST /api/admin-activities/upload-image - Upload activity image
 *
 * Features:
 * - PAR framework: Problem, Action, Result fields for structured impact reporting
 * - Image upload with Cloudinary integration
 * - Slug-based public URLs for SEO
 * - Order-based sorting for display priority
 * - Active/inactive status control
 */

// ==================== IMPORTS ====================
const AdminActivity = require('../models/AdminActivity');
const cloudinary = require('../config/cloudinary');
const fs = require('fs/promises');

// ==================== UTILITY FUNCTIONS ====================

/**
 * CLEANUP TEMP UPLOAD
 *
 * Removes temporary uploaded files from the server after processing.
 * Prevents disk space accumulation from failed uploads.
 *
 * @param {string} filePath - Path to the temporary file to delete
 */
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

// ==================== CONTROLLER FUNCTIONS ====================

/**
 * GET ALL ADMIN ACTIVITIES
 *
 * Retrieves all active administrative activities sorted by display order.
 * Used for public display and admin management listings.
 *
 * @route GET /api/admin-activities
 * @access Public (for display) / Admin (for management)
 * @returns {Array} Active admin activities sorted by order
 */
const getAdminActivities = async (req, res) => {
  try {
    const activities = await AdminActivity.find({ isActive: true }).sort({ order: 1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * GET ADMIN ACTIVITY BY SLUG
 *
 * Retrieves a specific admin activity by its URL slug.
 * Used for public activity detail pages with SEO-friendly URLs.
 *
 * @route GET /api/admin-activities/:slug
 * @access Public
 * @param {string} slug - URL-friendly identifier (e.g., 'health-campaigns')
 * @returns {Object} Activity object if found and active
 * @returns {404} If activity not found or inactive
 */
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

/**
 * CREATE ADMIN ACTIVITY
 *
 * Creates a new administrative activity with optional image upload.
 * Supports the PAR framework fields for structured impact documentation.
 *
 * @route POST /api/admin-activities
 * @access Admin
 * @param {Object} req.body - Activity data
 * @param {string} req.body.name - Activity name
 * @param {string} req.body.slug - URL slug
 * @param {string} req.body.description - Brief description
 * @param {string} req.body.content - Full content (HTML)
 * @param {string} [req.body.problem] - PAR: Problem statement
 * @param {string} [req.body.action] - PAR: Actions taken
 * @param {string} [req.body.result] - PAR: Results achieved
 * @param {string} [req.body.impactNumber] - Quantitative impact
 * @param {number} [req.body.order] - Display order
 * @param {boolean} [req.body.isActive] - Active status
 * @param {File} [req.file] - Image file for upload
 * @returns {Object} Created activity
 */
const createAdminActivity = async (req, res) => {
  try {
    const { name, slug, description, content, impactNumber, problem, action, result } = req.body;
    const order = Number.isFinite(Number(req.body.order)) ? Number(req.body.order) : 0;
    let imageUrl = req.body.image;

    // Handle image upload if file provided
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

/**
 * UPLOAD ADMIN ACTIVITY IMAGE
 *
 * Handles image uploads for admin activities.
 * Separate endpoint for inline image uploads during content editing.
 *
 * @route POST /api/admin-activities/upload-image
 * @access Admin
 * @param {File} req.file - Image file to upload
 * @returns {Object} Object with imageUrl
 * @returns {400} If no file provided
 */
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

/**
 * UPDATE ADMIN ACTIVITY
 *
 * Updates an existing administrative activity with optional image replacement.
 * Maintains existing values for fields not provided in the update.
 *
 * @route PUT /api/admin-activities/:id
 * @access Admin
 * @param {string} id - Activity ID from URL
 * @param {Object} req.body - Updated activity data (same as create)
 * @param {File} [req.file] - New image file (optional)
 * @returns {Object} Updated activity
 * @returns {404} If activity not found
 */
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

/**
 * DELETE ADMIN ACTIVITY
 *
 * Permanently removes an administrative activity from the database.
 * Note: This is a hard delete - consider soft delete for audit trails.
 *
 * @route DELETE /api/admin-activities/:id
 * @access Admin
 * @param {string} id - Activity ID to delete
 * @returns {Object} Success message
 * @returns {404} If activity not found
 */
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

// ==================== EXPORTS ====================
module.exports = {
  getAdminActivities,
  getAdminActivityBySlug,
  createAdminActivity,
  uploadAdminActivityImage,
  updateAdminActivity,
  deleteAdminActivity
};

