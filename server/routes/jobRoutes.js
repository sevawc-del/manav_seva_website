const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJobById,
  getAllJobs,
  createJob,
  updateJob,
  deleteJob
} = require('../controllers/jobController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/admin', protect, admin, getAllJobs);
router.get('/', getJobs);
router.get('/:id', getJobById);

// Admin routes

router.post('/admin', protect, admin, createJob);
router.put('/admin/:id', protect, admin, updateJob);
router.delete('/admin/:id', protect, admin, deleteJob);

module.exports = router;
