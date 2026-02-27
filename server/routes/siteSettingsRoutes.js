const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getSiteSettings,
  createOrUpdateSiteSettings
} = require('../controllers/siteSettingsController');

const handleUploadError = (req, res, next) => {
  upload.fields([
    { name: 'logoFile', maxCount: 1 },
    { name: 'chairpersonImageFile', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      console.warn('Upload warning (non-fatal):', err.message);
      req.file = null;
      req.files = null;
    }
    next();
  });
};

router.get('/', getSiteSettings);
router.get('/admin', protect, admin, getSiteSettings);
router.post('/admin', protect, admin, handleUploadError, createOrUpdateSiteSettings);

module.exports = router;
