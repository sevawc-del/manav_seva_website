const express = require('express');
const router = express.Router();
const { getJourneys, getJourneyById, createJourney, updateJourney, deleteJourney } = require('../controllers/journeyController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getJourneys);
router.get('/:id', getJourneyById);

// Admin routes (protected)
router.post('/admin', protect, admin, createJourney);
router.put('/admin/:id', protect, admin, updateJourney);
router.delete('/admin/:id', protect, admin, deleteJourney);

module.exports = router;
