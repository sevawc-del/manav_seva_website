const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  createDonationOrder,
  handleRazorpayWebhook,
  getDonationStatus,
  getDonationsAdmin
} = require('../controllers/donationController');

router.post('/create-order', createDonationOrder);
router.post('/webhook', handleRazorpayWebhook);
router.get('/admin', protect, admin, getDonationsAdmin);
router.get('/status/:orderId', getDonationStatus);

module.exports = router;
