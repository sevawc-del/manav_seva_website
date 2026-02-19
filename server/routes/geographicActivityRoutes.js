const express = require('express');
const router = express.Router();
const { getGeographicActivities, getGeographicActivityPresence, createGeographicActivity, updateGeographicActivity, deleteGeographicActivity } = require('../controllers/geographicActivityController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/geographic-activities', getGeographicActivities);
router.get('/geographic-activities/:id/presence', getGeographicActivityPresence);

// Admin routes
router.post('/admin/geographic-activity', protect, admin, createGeographicActivity);
router.put('/admin/geographic-activity/:id', protect, admin, updateGeographicActivity);
router.delete('/admin/geographic-activity/:id', protect, admin, deleteGeographicActivity);

module.exports = router;
