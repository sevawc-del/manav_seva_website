// Report Routes
const express = require('express');
const router = express.Router();
const {
  getAllReports,
  getAllReportsAdmin,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  uploadReportFile,
  createReportAccessRequest,
  getReportAccessRequests,
  updateReportAccessRequestStatus,
  getReportDownloadLink
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
router.get('/admin', protect, admin, getAllReportsAdmin);
router.get('/access-requests', protect, admin, getReportAccessRequests);
router.put('/access-requests/:id/status', protect, admin, updateReportAccessRequestStatus);
router.post('/upload-file', protect, admin, handleUploadError, uploadReportFile);
router.post('/:id/request-access', createReportAccessRequest);
router.get('/:id/download-link', getReportDownloadLink);
router.get('/:id', getReportById);
router.post('/', protect, admin, createReport);
router.put('/:id', protect, admin, updateReport);
router.delete('/:id', protect, admin, deleteReport);

module.exports = router;
