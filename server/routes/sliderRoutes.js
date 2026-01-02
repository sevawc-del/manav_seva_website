const express = require('express');
const router = express.Router();
const {
  getSliders,
  getAllSliders,
  getSliderById,
  createSlider,
  updateSlider,
  deleteSlider
} = require('../controllers/sliderController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Helper middleware to handle upload errors gracefully
const handleUploadError = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.warn('Upload warning (non-fatal):', err.message);
      // Continue even if upload fails - use URL from body instead
      req.file = null;
    }
    next();
  });
};

// Public routes
router.get('/admin', getAllSliders);  // Must come BEFORE /:id to avoid wildcard match
router.get('/', getSliders);
router.get('/:id', getSliderById);

// Admin routes
router.post('/admin', authMiddleware, handleUploadError, createSlider);
router.put('/admin/:id', authMiddleware, handleUploadError, updateSlider);
router.delete('/admin/:id', authMiddleware, deleteSlider);

module.exports = router;
