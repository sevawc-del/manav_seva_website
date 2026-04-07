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
  getTenderDocumentLink,
  submitTenderApplication
} = require('../controllers/tenderController');
const { protect, admin } = require('../middleware/authMiddleware');
const fileUpload = require('../middleware/fileUploadMiddleware');
const { createRateLimiter } = require('../middleware/rateLimitMiddleware');

const handleUploadError = (req, res, next) => {
  fileUpload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: 'Invalid file upload' });
    }
    next();
  });
};

const tenderApplyRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: 'Too many tender application attempts. Please try again later.'
});

const uploadTenderApplicationDocument = (req, res, next) => {
  fileUpload.single('proposalDocument')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Invalid proposal document upload' });
    }
    return next();
  });
};

router.get('/', getAllTenders);
router.post('/upload-document', protect, admin, handleUploadError, uploadTenderDocument);
router.post('/apply', tenderApplyRateLimiter, uploadTenderApplicationDocument, submitTenderApplication);
router.get('/:id/document-link', getTenderDocumentLink);
router.get('/:id', getTenderById);
router.post('/', protect, admin, createTender);
router.put('/:id', protect, admin, updateTender);
router.delete('/:id', protect, admin, deleteTender);

module.exports = router;
