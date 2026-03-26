const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const generateToken = require('../utils/generateToken');
const ArtistProfile = require('../models/artistProfileModel');
const BuyerProfile = require('../models/buyerProfileModel');


// REGISTER USER
exports.registerUser = async (req, res) => {

  try {

    const { name, email, password, role } = req.body;

    // Prevent admin registration
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin registration is not allowed'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};


// LOGIN USER
exports.loginUser = async (req, res) => {

  try {

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated. Please contact support."
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Get Profile for Avatar
    let avatar = null;
    if (user.role === 'artist') {
      const profile = await ArtistProfile.findOne({ user: user._id }).select('avatar');
      if (profile && profile.avatar) avatar = profile.avatar;
    } else if (user.role === 'user') {
      const profile = await BuyerProfile.findOne({ user: user._id }).select('avatar');
      if (profile && profile.avatar) avatar = profile.avatar;
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar
      }
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};


// GET ME - Get current user data and profile status
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let isProfileComplete = false;
    let profileData = null;

    if (user.role === 'artist') {
      profileData = await ArtistProfile.findOne({ user: user._id });
      // Basic check: has bio and at least a few other fields
      if (profileData && profileData.bio && profileData.artistName && profileData.country) {
        isProfileComplete = true;
      }
    } else if (user.role === 'user') {
      profileData = await BuyerProfile.findOne({ user: user._id });
      if (profileData && profileData.bio && profileData.location) {
        isProfileComplete = true;
      }
    } else {
      isProfileComplete = true; // Admins are always "complete" for this purpose
    }

    res.status(200).json({
      success: true,
      user,
      isProfileComplete,
      profileData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// DEACTIVATE ME
exports.deactivateMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// FORGOT PASSWORD (OTP)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with this email' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash OTP for security
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
    
    user.resetOTP = hashedOTP;
    user.resetOTPExpires = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

    await user.save();

    // Mock sending OTP
    console.log('--------------------------------------------------');
    console.log(`PASSWORD RESET OTP FOR: ${email}`);
    console.log(`OTP: ${otp}`);
    console.log('--------------------------------------------------');
    
    res.status(200).json({
      success: true,
      message: 'If your email is registered, you will receive a 6-digit OTP shortly.',
      otp: otp // Returning OTP in response as requested for development
    });
  } catch (error) {
    console.error('FORGOT PASSWORD ERROR:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// VERIFY OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and OTP' });
    }

    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      email,
      resetOTP: hashedOTP,
      resetOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('VERIFY OTP ERROR:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// RESET PASSWORD (WITH OTP)
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email, OTP and new password' });
    }

    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      email,
      resetOTP: hashedOTP,
      resetOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Hash and update new password
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(password, salt);
    
    // Clear OTP fields
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now login.'
    });
  } catch (error) {
    console.error('RESET PASSWORD ERROR:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// CREATE ADMIN - Only for authenticated admins
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Check if admin already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Handle avatar upload
    let avatarPath = null;
    if (req.file) {
      avatarPath = req.file.path.replace(/\\/g, '/');
    }

    // Create admin
    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      avatar: avatarPath
    });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        avatar: admin.avatar
      }
    });

  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};


// DELETE ADMIN - Only for authenticated admins
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account'
      });
    }

    // Delete admin
    const deletedAdmin = await User.findByIdAndDelete(id);

    if (!deletedAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admin deleted successfully',
      data: deletedAdmin
    });

  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};


// GET ALL ADMINS - Only for authenticated admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password');

    res.status(200).json({
      success: true,
      data: admins
    });

  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};