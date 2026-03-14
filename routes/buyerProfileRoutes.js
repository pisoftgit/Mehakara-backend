const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  createProfile,
  updateProfile,
  getProfile,
  deleteProfile
} = require('../controllers/buyerProfileController');

// Multer setup for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = `uploads/buyers/${req.user._id}`;
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  // Only images allowed
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter });


// Create profile (buyer only)
router.post('/', protect, upload.single('avatar'), createProfile);

// Update profile (buyer only)
router.put('/', protect, upload.single('avatar'), updateProfile);

// Get logged-in buyer profile
router.get('/', protect, getProfile);

// Delete buyer profile
router.delete('/', protect, deleteProfile);

module.exports = router;