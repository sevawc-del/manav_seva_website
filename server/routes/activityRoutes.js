const express = require('express');
const router = express.Router();
const { getActivities, getActivityPresence, createActivity } = require('../controllers/activityController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getActivities);
router.get('/:id/presence', getActivityPresence);

// Admin routes
router.post('/admin/activity', protect, admin, createActivity);

module.exports = router;
