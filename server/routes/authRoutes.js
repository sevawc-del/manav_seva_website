// Auth Routes
const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const { createRateLimiter } = require('../middleware/rateLimitMiddleware');
const { validateLogin } = require('../middleware/validationMiddleware');

const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  message: 'Too many auth attempts. Please try again later.'
});

router.post('/login', authRateLimiter, validateLogin, login);

module.exports = router;
