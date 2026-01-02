const express = require('express');
const router = express.Router();
const { getJourneys, getJourneyById, createJourney, updateJourney, deleteJourney } = require('../controllers/journeyController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/', getJourneys);
router.get('/:id', getJourneyById);

// Admin routes (protected)
router.post('/admin', authMiddleware, createJourney);
router.put('/admin/:id', authMiddleware, updateJourney);
router.delete('/admin/:id', authMiddleware, deleteJourney);

module.exports = router;
