const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

// Get admin stats
router.get('/admin', protect, restrictTo('admin', 'superadmin'), statsController.getAdminStats);

// Get artist stats
router.get('/artist', protect, restrictTo('artist'), statsController.getArtistStats);

module.exports = router;
