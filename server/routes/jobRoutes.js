const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJobById,
  getAllJobs,
  createJob,
  updateJob,
  deleteJob,
  submitJobApplication
} = require('../controllers/jobController');
const { protect, admin } = require('../middleware/authMiddleware');
const fileUpload = require('../middleware/fileUploadMiddleware');
const { createRateLimiter } = require('../middleware/rateLimitMiddleware');

const jobApplyRateLimiter = createRateLimiter({
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
router.get('/admin', protect, admin, getAllJobs);
router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/apply', jobApplyRateLimiter, uploadResume, submitJobApplication);

// Admin routes

router.post('/admin', protect, admin, createJob);
router.put('/admin/:id', protect, admin, updateJob);
router.delete('/admin/:id', protect, admin, deleteJob);

module.exports = router;
