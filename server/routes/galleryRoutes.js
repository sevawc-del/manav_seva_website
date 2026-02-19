// Gallery Routes
const express = require('express');
const router = express.Router();
const {
  getAllGalleryItems,
  getGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} = require('../controllers/galleryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getAllGalleryItems);
router.get('/:id', getGalleryItemById);
router.post('/', protect, admin, createGalleryItem);
router.put('/:id', protect, admin, updateGalleryItem);
router.delete('/:id', protect, admin, deleteGalleryItem);

module.exports = router;
