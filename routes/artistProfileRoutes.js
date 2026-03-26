const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const uploadArtist = require('../middlewares/uploadArtist');
const {
  createProfile,
  updateProfile,
  getProfile,
  getProfileById,
  deleteProfile
} = require('../controllers/artistProfileController');

// CREATE artist profile (only artist/admin)
router.post(
  '/',
  protect,
  uploadArtist.fields([{ name: 'avatar', maxCount: 1 }, { name: 'portfolioImages', maxCount: 10 }]),
  createProfile
);

// UPDATE artist profile (only artist/admin)
router.put(
  '/',
  protect,
  uploadArtist.fields([{ name: 'avatar', maxCount: 1 }, { name: 'portfolioImages', maxCount: 10 }]),
  updateProfile
);

// GET logged-in artist profile
router.get('/me', protect, getProfile);

// GET artist profile by user ID
router.get('/:userId', getProfileById);

// DELETE artist profile (only artist)
router.delete('/', protect, deleteProfile);

module.exports = router;