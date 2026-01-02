const express = require('express');
const router = express.Router();
const {
  getAdminActivities,
  getAdminActivityBySlug,
  createAdminActivity,
  updateAdminActivity,
  deleteAdminActivity
} = require('../controllers/adminActivityController');

// Routes for admin activities
router.get('/admin-activities', getAdminActivities);
router.get('/admin-activities/:slug', getAdminActivityBySlug);
router.post('/admin/admin-activities', createAdminActivity);
router.put('/admin/admin-activities/:id', updateAdminActivity);
router.delete('/admin/admin-activities/:id', deleteAdminActivity);

module.exports = router;
