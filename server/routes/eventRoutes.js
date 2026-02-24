const express = require('express');
const router = express.Router();
const {
  getPublicEvents,
  getAllEventsAdmin,
  getEventBySlug,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');
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

router.get('/', getPublicEvents);
router.get('/slug/:slug', getEventBySlug);
router.get('/admin', protect, admin, getAllEventsAdmin);
router.post('/admin', protect, admin, handleUploadError, createEvent);
router.put('/admin/:id', protect, admin, handleUploadError, updateEvent);
router.delete('/admin/:id', protect, admin, deleteEvent);

module.exports = router;
