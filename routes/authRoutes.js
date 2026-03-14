const express = require('express');
const router = express.Router();

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

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.post('/deactivate', protect, deactivateMe);

// Admin management routes - STRICTLY ADMIN ONLY
router.post('/create-admin', protect, restrictTo('admin'), createAdmin);
router.delete('/admin/:id', protect, restrictTo('admin'), deleteAdmin);
router.get('/admins', protect, restrictTo('admin'), getAllAdmins);

module.exports = router;