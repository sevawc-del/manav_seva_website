const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getDonationSettings,
  createOrUpdateDonationSettings
} = require('../controllers/donationSettingsController');

const handleUploadError = (req, res, next) => {
  upload.fields([
    { name: 'qrImageFile', maxCount: 1 },
    { name: 'signatureImageFile', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: 'Invalid image upload' });
    }
    next();
  });
};

router.get('/', getDonationSettings);
router.get('/admin', protect, admin, getDonationSettings);
router.post('/admin', protect, admin, handleUploadError, createOrUpdateDonationSettings);

module.exports = router;
