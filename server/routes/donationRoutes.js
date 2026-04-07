const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { createRateLimiter } = require('../middleware/rateLimitMiddleware');
const {
  createDonationOrder,
  handleRazorpayWebhook,
  getDonationStatus,
  getDonationsAdmin
} = require('../controllers/donationController');

const createDonationOrderRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 8,
  message: 'Too many donation attempts. Please try again after some time.'
});

const donationStatusRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 30,
  message: 'Too many status checks. Please try again shortly.'
});

router.post('/create-order', createDonationOrderRateLimiter, createDonationOrder);
router.post('/webhook', handleRazorpayWebhook);
router.get('/admin', protect, admin, getDonationsAdmin);
router.get('/status/:orderId', donationStatusRateLimiter, getDonationStatus);

module.exports = router;
