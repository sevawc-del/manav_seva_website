const express = require('express');
const router = express.Router();
const { createRateLimiter } = require('../middleware/rateLimitMiddleware');
const { validateTestimonial } = require('../middleware/validationMiddleware');
const {
  getPublicTestimonials,
  submitTestimonial,
  getAllTestimonialsAdmin,
  updateTestimonialAdmin,
  deleteTestimonialAdmin
} = require('../controllers/testimonialController');
const { protect, admin } = require('../middleware/authMiddleware');

const testimonialSubmitRateLimiter = createRateLimiter({
  windowMs: 30 * 60 * 1000,
  maxRequests: 5,
  message: 'Too many feedback submissions. Please try again later.'
});

router.get('/', getPublicTestimonials);
router.post('/', testimonialSubmitRateLimiter, validateTestimonial, submitTestimonial);
router.get('/admin', protect, admin, getAllTestimonialsAdmin);
router.put('/admin/:id', protect, admin, updateTestimonialAdmin);
router.delete('/admin/:id', protect, admin, deleteTestimonialAdmin);

module.exports = router;
