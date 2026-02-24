const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getPublicSponsors,
  getAllSponsorsAdmin,
  createSponsor,
  updateSponsor,
  deleteSponsor
} = require('../controllers/sponsorController');

const handleUploadError = (req, res, next) => {
  upload.single('logoFile')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: 'Invalid logo upload' });
    }
    next();
  });
};

router.get('/', getPublicSponsors);
router.get('/admin', protect, admin, getAllSponsorsAdmin);
router.post('/admin', protect, admin, handleUploadError, createSponsor);
router.put('/admin/:id', protect, admin, handleUploadError, updateSponsor);
router.delete('/admin/:id', protect, admin, deleteSponsor);

module.exports = router;
