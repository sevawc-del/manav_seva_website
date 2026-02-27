// Tender Routes
const express = require('express');
const router = express.Router();
const {
  getAllTenders,
  getTenderById,
  createTender,
  updateTender,
  deleteTender,
  uploadTenderDocument,
} = require('../controllers/tenderController');
const { protect, admin } = require('../middleware/authMiddleware');
const fileUpload = require('../middleware/fileUploadMiddleware');

const handleUploadError = (req, res, next) => {
  fileUpload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: 'Invalid file upload' });
    }
    next();
  });
};

router.get('/', getAllTenders);
router.post('/upload-document', protect, admin, handleUploadError, uploadTenderDocument);
router.get('/:id', getTenderById);
router.post('/', protect, admin, createTender);
router.put('/:id', protect, admin, updateTender);
router.delete('/:id', protect, admin, deleteTender);

module.exports = router;
