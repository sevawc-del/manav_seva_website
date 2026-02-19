// Contact Routes
const express = require('express');
const router = express.Router();
const { sendContactMessage } = require('../controllers/contactController');
const { createRateLimiter } = require('../middleware/rateLimitMiddleware');
const { validateContact } = require('../middleware/validationMiddleware');

const contactRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: 'Too many contact requests. Please try again later.'
});

router.post('/', contactRateLimiter, validateContact, sendContactMessage);

module.exports = router;
