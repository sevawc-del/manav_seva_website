const express = require('express');
const router = express.Router();
const {
  getVolunteers,
  getVolunteerById,
  getAllVolunteers,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
  createVolunteerApplication,
  getAllVolunteerApplications,
  updateVolunteerApplicationStatus
} = require('../controllers/volunteerController');
const { protect, admin } = require('../middleware/authMiddleware');
const { createRateLimiter } = require('../middleware/rateLimitMiddleware');
const { validateVolunteerApplication } = require('../middleware/validationMiddleware');

const volunteerApplyRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: 'Too many application attempts. Please try again later.'
});

// Public routes
router.get('/public', getVolunteers);
router.get('/public/:id', getVolunteerById);

// Public routes
router.post('/apply', volunteerApplyRateLimiter, validateVolunteerApplication, createVolunteerApplication);

// Admin routes
router.get('/', protect, admin, getAllVolunteers);
router.post('/', protect, admin, createVolunteer);
router.put('/:id', protect, admin, updateVolunteer);
router.delete('/:id', protect, admin, deleteVolunteer);

// Admin application routes
router.get('/applications', protect, admin, getAllVolunteerApplications);
router.put('/applications/:id', protect, admin, updateVolunteerApplicationStatus);

module.exports = router;
