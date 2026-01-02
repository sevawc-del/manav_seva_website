const express = require('express');
const router = express.Router();
const { getGeographicActivities, getGeographicActivityPresence, createGeographicActivity, updateGeographicActivity, deleteGeographicActivity } = require('../controllers/geographicActivityController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/geographic-activities', getGeographicActivities);
router.get('/geographic-activities/:id/presence', getGeographicActivityPresence);

// Admin routes
router.post('/admin/geographic-activity', createGeographicActivity);
router.put('/admin/geographic-activity/:id', updateGeographicActivity);
router.delete('/admin/geographic-activity/:id', deleteGeographicActivity);

module.exports = router;
