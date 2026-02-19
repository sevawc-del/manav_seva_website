// Tender Routes
const express = require('express');
const router = express.Router();
const {
  getAllTenders,
  getTenderById,
  createTender,
  updateTender,
  deleteTender,
} = require('../controllers/tenderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getAllTenders);
router.get('/:id', getTenderById);
router.post('/', protect, admin, createTender);
router.put('/:id', protect, admin, updateTender);
router.delete('/:id', protect, admin, deleteTender);

module.exports = router;
