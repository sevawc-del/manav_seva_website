const express = require('express');
const router = express.Router();
const { getActivities, getActivityPresence, createActivity } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getActivities);
router.get('/:id/presence', getActivityPresence);

// Admin routes
router.post('/admin/activity', createActivity);

module.exports = router;
