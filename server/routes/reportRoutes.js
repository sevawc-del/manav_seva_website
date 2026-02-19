// Report Routes
const express = require('express');
const router = express.Router();
const {
  getAllReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
} = require('../controllers/reportController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getAllReports);
router.get('/:id', getReportById);
router.post('/', protect, admin, createReport);
router.put('/:id', protect, admin, updateReport);
router.delete('/:id', protect, admin, deleteReport);

module.exports = router;
