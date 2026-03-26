const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { 
  registerUser, 
  loginUser, 
  createAdmin, 
  deleteAdmin, 
  getAllAdmins, 
  getMe, 
  deactivateMe,
  forgotPassword,
  verifyOTP,
  resetPassword 
} = require('../controllers/authController');
const validate = require('../middlewares/validate');
const { registerSchema , loginSchema } = require('../validators/authValidator');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

// Multer config for admin avatar
const adminAvatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/admins');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `admin-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const uploadAdminAvatar = multer({
  storage: adminAvatarStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed!'), false);
  },
  limits: { fileSize: 300 * 1024 }
});

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.post('/deactivate', protect, deactivateMe);

// Admin management routes - STRICTLY ADMIN ONLY
router.post('/create-admin', protect, restrictTo('admin'), uploadAdminAvatar.single('avatar'), createAdmin);
router.delete('/admin/:id', protect, restrictTo('admin'), deleteAdmin);
router.get('/admins', protect, restrictTo('admin'), getAllAdmins);

module.exports = router;