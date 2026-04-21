// News Routes
const express = require('express');
const router = express.Router();
const {
  getAllNews,
  getNewsSummary,
  getNewsById,
  getNewsBySlug,
  createNews,
  uploadNewsImage,
  updateNews,
  deleteNews,
} = require('../controllers/newsController');
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

router.get('/', getAllNews);
router.get('/summary', getNewsSummary);
router.get('/slug/:slug', getNewsBySlug);
router.post('/upload-image', protect, admin, handleUploadError, uploadNewsImage);
router.get('/:id', getNewsById);
router.post('/', protect, admin, handleUploadError, createNews);
router.put('/:id', protect, admin, handleUploadError, updateNews);
router.delete('/:id', protect, admin, deleteNews);

module.exports = router;
