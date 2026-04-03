const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const generateToken = require('../utils/generateToken');
const ArtistProfile = require('../models/artistProfileModel');
const BuyerProfile = require('../models/buyerProfileModel');
const Permission = require('../models/permissionModel');
const sendEmail = require('../utils/sendEmail');
const Artwork = require('../models/artworkModel');
const Order = require('../models/orderModel');
const Bid = require('../models/bidModel');


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

    // Generate 6-character alphanumeric OTP
    const otp = crypto.randomBytes(3).toString('hex').toUpperCase();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Create user (unverified)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      verificationOTP: otp,
      verificationOTPExpires: otpExpires
    });

    // For testing: Log OTP to console
    console.log('--------------------------------------------------');
    console.log(`REGISTRATION OTP FOR: ${email}`);
    console.log(`OTP: ${otp}`);
    console.log('--------------------------------------------------');

    try {
      await sendEmail({
        email: user.email,
        subject: 'Verify your Mehakara Account',
        message: `Your account verification OTP is: ${otp}. Valid for 10 minutes.`,
        html: `<h3>Welcome to Mehakara!</h3><p>Your verification code is: <b>${otp}</b></p>`
      });
    } catch (err) {
      console.log('Email could not be sent', err);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please verify your email with the OTP sent.',
      userId: user._id
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
    const user = await User.findOne({ email }).populate('permissions');

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

    // Check if verified
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email to login.",
        isUnverified: true,
        userId: user._id
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
        avatar,
        permissions: user.permissions || []
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
    const user = await User.findById(req.user._id).select('-password').populate('permissions');
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

exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin disabling themselves
    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate yourself'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: user.isActive
    });

  } catch (error) {
    console.error('TOGGLE USER STATUS ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
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
    if (req.user._id.toString() === id) {
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
    const admins = await User.find({ role: 'admin' }).select('-password').populate('permissions');

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

// --- PERMISSION MODULES ---

exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find();
    res.status(200).json({ success: true, data: permissions });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.createPermission = async (req, res) => {
  try {
    const { title, url } = req.body;
    const permission = await Permission.create({ title, url });
    res.status(201).json({ success: true, data: permission });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updatePermission = async (req, res) => {
  try {
    const permission = await Permission.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: permission });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deletePermission = async (req, res) => {
  try {
    await Permission.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Permission deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.assignPermissions = async (req, res) => {
  try {
    const { adminId, permissionIds } = req.body;
    const user = await User.findByIdAndUpdate(
      adminId,
      { permissions: permissionIds },
      { new: true }
    ).populate('permissions');
    
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


// GET ALL USERS (with pagination, role filter, search) - Admin only
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);

    let query = {};

    // Filter by role if provided
    if (role && ['artist', 'user'].includes(role)) {
      query.role = role;
    } else {
      // By default exclude admins — show only artists and buyers
      query.role = { $in: ['artist', 'user'] };
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    // For artists, also fetch their profile data
    let usersWithProfiles = users;
    
    // Fetch Artist Profiles and Stats
    const artistIds = users.filter(u => u.role === 'artist').map(u => u._id);
    if (artistIds.length > 0) {
      const [artistProfiles, artistArtworks, artistOrders] = await Promise.all([
        ArtistProfile.find({ user: { $in: artistIds } }).populate('categories'),
        Artwork.find({ artist: { $in: artistIds } }),
        Order.find({ artistId: { $in: artistIds } })
      ]);

      const artistProfileMap = {};
      artistProfiles.forEach(p => { artistProfileMap[p.user.toString()] = p; });

      usersWithProfiles = usersWithProfiles.map(u => {
        const userObj = u.toObject();
        if (u.role === 'artist') {
          if (artistProfileMap[u._id.toString()]) {
            userObj.artistProfile = artistProfileMap[u._id.toString()];
          }
          const userArtworks = artistArtworks.filter(a => a.artist.toString() === u._id.toString());
          const userOrders = artistOrders.filter(o => o.artistId.toString() === u._id.toString());
          userObj.stats = {
            totalArtworks: userArtworks.length,
            totalSales: userOrders.filter(o => o.status === 'confirmed' || o.status === 'delivered').length,
            totalOrders: userOrders.length,
            totalRevenue: userOrders.filter(o => o.status === 'confirmed' || o.status === 'delivered')
                                   .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
          };
          userObj.recentOrders = userOrders.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
        }
        return userObj;
      });
    }

    // Fetch Buyer Profiles and Stats
    const buyerIds = users.filter(u => u.role === 'user').map(u => u._id);
    if (buyerIds.length > 0) {
      const [buyerProfiles, buyerOrders, buyerBids] = await Promise.all([
        BuyerProfile.find({ user: { $in: buyerIds } }).populate('subcategories'),
        Order.find({ buyerId: { $in: buyerIds } }).populate('artworkId', 'title images'),
        Bid.find({ bidderId: { $in: buyerIds } }).populate('artworkId', 'title images')
      ]);

      const buyerProfileMap = {};
      buyerProfiles.forEach(p => { buyerProfileMap[p.user.toString()] = p; });

      usersWithProfiles = usersWithProfiles.map(u => {
        const userObj = u.constructor.name === 'Object' ? u : u.toObject();
        if (u.role === 'user') {
          if (buyerProfileMap[u._id.toString()]) {
            userObj.buyerProfile = buyerProfileMap[u._id.toString()];
          }
          const userOrders = buyerOrders.filter(o => o.buyerId.toString() === u._id.toString());
          const userBids = buyerBids.filter(b => b.bidderId.toString() === u._id.toString());
          userObj.stats = {
            totalOrdersPlaced: userOrders.length,
            totalBidsPlaced: userBids.length,
            totalSpend: userOrders.filter(o => o.status === 'confirmed' || o.status === 'delivered')
                                 .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
          };
          userObj.recentOrders = userOrders.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
          userObj.recentBids = userBids.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
        }
        return userObj;
      });
    }

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      users: usersWithProfiles
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// VERIFY EMAIL
exports.verifyEmail = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.verificationOTP !== otp || user.verificationOTPExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Mark as verified
    user.isVerified = true;
    user.verificationOTP = undefined;
    user.verificationOTPExpires = undefined;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
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
    res.status(500).json({ success: false, message: 'Server error' });
  }
};