// Report Routes
const express = require('express');
const router = express.Router();
const {
  getAllReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  uploadReportFile,
} = require('../controllers/reportController');
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

router.get('/', getAllReports);
router.post('/upload-file', protect, admin, handleUploadError, uploadReportFile);
router.get('/:id', getReportById);
router.post('/', protect, admin, createReport);
router.put('/:id', protect, admin, updateReport);
router.delete('/:id', protect, admin, deleteReport);

module.exports = router;
