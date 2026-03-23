const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect } = require('../middlewares/authMiddleware');
const uploadSettings = require('../middlewares/uploadSettings');

// GET settings (Public)
router.get('/', settingsController.getSettings);

// PATCH settings (Admin Only)
router.patch('/', protect, settingsController.updateSettings);

// POST upload media (Admin Only)
router.post('/upload', protect, uploadSettings.single('file'), settingsController.uploadMedia);

module.exports = router;
