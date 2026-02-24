const express = require('express');
const router = express.Router();
const {
  getPublicTestimonials,
  submitTestimonial,
  getAllTestimonialsAdmin,
  updateTestimonialAdmin,
  deleteTestimonialAdmin
} = require('../controllers/testimonialController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getPublicTestimonials);
router.post('/', submitTestimonial);
router.get('/admin', protect, admin, getAllTestimonialsAdmin);
router.put('/admin/:id', protect, admin, updateTestimonialAdmin);
router.delete('/admin/:id', protect, admin, deleteTestimonialAdmin);

module.exports = router;
