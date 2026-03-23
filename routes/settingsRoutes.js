const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

// Get all dynamic settings (PUBLIC)
router.get('/', settingsController.getSettings);

// Update settings (ADMIN ONLY)
router.patch('/', protect, restrictTo('admin'), settingsController.updateSettings);

module.exports = router;
