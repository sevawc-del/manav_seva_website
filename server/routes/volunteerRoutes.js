const express = require('express');
const router = express.Router();
const {
  getVolunteers,
  getVolunteerById,
  getAllVolunteers,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
  createVolunteerApplication
} = require('../controllers/volunteerController');
const { protect, admin } = require('../middleware/authMiddleware');
const { createRateLimiter } = require('../middleware/rateLimitMiddleware');
const fileUpload = require('../middleware/fileUploadMiddleware');

const volunteerApplyRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: 'Too many application attempts. Please try again later.'
});

const uploadResume = (req, res, next) => {
  fileUpload.single('resume')(req, res, (error) => {
    if (error) {
      return res.status(400).json({ message: error.message || 'Invalid resume upload' });
    }
    return next();
  });
};

// Public routes
router.get('/public', getVolunteers);
router.get('/public/:id', getVolunteerById);

// Public routes
router.post('/apply', volunteerApplyRateLimiter, uploadResume, createVolunteerApplication);

// Admin routes
router.get('/', protect, admin, getAllVolunteers);
router.post('/', protect, admin, createVolunteer);
router.put('/:id', protect, admin, updateVolunteer);
router.delete('/:id', protect, admin, deleteVolunteer);

module.exports = router;
