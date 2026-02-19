const express = require('express');
const router = express.Router();
const {
  getAdminActivities,
  getAdminActivityBySlug,
  createAdminActivity,
  updateAdminActivity,
  deleteAdminActivity
} = require('../controllers/adminActivityController');
const { protect, admin } = require('../middleware/authMiddleware');

// Routes for admin activities
router.get('/admin-activities', getAdminActivities);
router.get('/admin-activities/:slug', getAdminActivityBySlug);
router.post('/admin/admin-activities', protect, admin, createAdminActivity);
router.put('/admin/admin-activities/:id', protect, admin, updateAdminActivity);
router.delete('/admin/admin-activities/:id', protect, admin, deleteAdminActivity);

module.exports = router;
