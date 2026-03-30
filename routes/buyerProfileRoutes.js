const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
const uploadBuyerAvatar = require('../middlewares/uploadBuyer');

const {
  createProfile,
  updateProfile,
  getProfile,
  deleteProfile
} = require('../controllers/buyerProfileController');

// Create profile
router.post(
  '/',
  protect,
  uploadBuyerAvatar.single('avatar'),
  createProfile
);

// Update profile
router.put(
  '/',
  protect,
  uploadBuyerAvatar.single('avatar'),
  updateProfile
);

// Get profile
router.get('/', protect, getProfile);

// Delete profile
router.delete('/', protect, deleteProfile);

module.exports = router;