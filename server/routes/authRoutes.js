// Auth Routes
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { createRateLimiter } = require('../middleware/rateLimitMiddleware');
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');

const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  message: 'Too many auth attempts. Please try again later.'
});

router.post('/register', authRateLimiter, validateRegister, register);
router.post('/login', authRateLimiter, validateLogin, login);

module.exports = router;
