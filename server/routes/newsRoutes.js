// News Routes
const express = require('express');
const router = express.Router();
const {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
} = require('../controllers/newsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getAllNews);
router.get('/:id', getNewsById);
router.post('/', protect, admin, createNews);
router.put('/:id', protect, admin, updateNews);
router.delete('/:id', protect, admin, deleteNews);

module.exports = router;
