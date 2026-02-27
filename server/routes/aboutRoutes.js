const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const handleUploadError = (req, res, next) => {
  upload.single('imageFile')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: 'Invalid image upload' });
    }
    next();
  });
};

// About Us
const { getAboutUs, createOrUpdateAboutUs, deleteAboutUs, uploadAboutImage } = require('../controllers/aboutUsController');
router.get('/about-us', getAboutUs);
router.post('/about-us', protect, admin, createOrUpdateAboutUs);
router.delete('/about-us', protect, admin, deleteAboutUs);
router.post('/upload-image', protect, admin, handleUploadError, uploadAboutImage);

// Governance
const { getGovernance, createOrUpdateGovernance, deleteGovernance } = require('../controllers/governanceController');
router.get('/governance', getGovernance);
router.post('/governance', protect, admin, createOrUpdateGovernance);
router.delete('/governance', protect, admin, deleteGovernance);

// Geographic Focus
const { getGeographicFocus, createOrUpdateGeographicFocus, deleteGeographicFocus } = require('../controllers/geographicFocusController');
router.get('/geographic-focus', getGeographicFocus);
router.post('/geographic-focus', protect, admin, createOrUpdateGeographicFocus);
router.delete('/geographic-focus', protect, admin, deleteGeographicFocus);

// Organization Structure
const { getOrganizationStructure, createOrUpdateOrganizationStructure, deleteOrganizationStructure } = require('../controllers/organizationStructureController');
router.get('/organization-structure', getOrganizationStructure);
router.post('/organization-structure', protect, admin, createOrUpdateOrganizationStructure);
router.delete('/organization-structure', protect, admin, deleteOrganizationStructure);

// Messages
const { getMessages, createOrUpdateMessage, deleteMessage } = require('../controllers/messageController');
router.get('/messages', getMessages);
router.post('/messages', protect, admin, createOrUpdateMessage);
router.delete('/messages/:id', protect, admin, deleteMessage);

module.exports = router;
