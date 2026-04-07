const express = require('express');
const router = express.Router();
const {
  getAdminActivities,
  getAdminActivityBySlug,
  createAdminActivity,
  uploadAdminActivityImage,
  updateAdminActivity,
  deleteAdminActivity
} = require('../controllers/adminActivityController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const handleUploadError = (req, res, next) => {
  upload.single('imageFile')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: 'Invalid image upload' });
    }
    next();
  });
};

// Routes for admin activities
router.get('/admin-activities', getAdminActivities);
router.get('/admin-activities/:slug', getAdminActivityBySlug);
router.post('/admin/admin-activities/upload-image', protect, admin, handleUploadError, uploadAdminActivityImage);
router.post('/admin/admin-activities', protect, admin, handleUploadError, createAdminActivity);
router.put('/admin/admin-activities/:id', protect, admin, handleUploadError, updateAdminActivity);
router.delete('/admin/admin-activities/:id', protect, admin, deleteAdminActivity);

module.exports = router;
