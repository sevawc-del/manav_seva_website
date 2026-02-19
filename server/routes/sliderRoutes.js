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
const { protect, admin } = require('../middleware/authMiddleware');
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

// Routes
router.get('/admin', protect, admin, getAllSliders);  // Must come BEFORE /:id to avoid wildcard match
router.get('/', getSliders);
router.get('/:id', getSliderById);

// Admin routes
router.post('/admin', protect, admin, handleUploadError, createSlider);
router.put('/admin/:id', protect, admin, handleUploadError, updateSlider);
router.delete('/admin/:id', protect, admin, deleteSlider);

module.exports = router;
