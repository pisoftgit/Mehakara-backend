const BuyerProfile = require('../models/buyerProfileModel');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

/**
 * Create buyer profile
 * - Only buyers can create their own profile
 */
exports.createProfile = async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ success: false, message: 'Only buyers can create their profile' });
    }

    // Check if profile already exists
    const existing = await BuyerProfile.findOne({ user: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Profile already exists. Use update API instead.' });
    }

    const { bio, location, subcategories } = req.body;

    let avatarUrl = null;
    if (req.file) {
      avatarUrl = `/uploads/buyers/${req.user._id}/${req.file.filename}`;
    }

    const profile = await BuyerProfile.create({
      user: req.user._id,
      bio,
      location,
      subcategories,
      avatar: avatarUrl
    });

    res.status(201).json({ success: true, message: 'Buyer profile created', profile });

  } catch (error) {
    console.error('CREATE BUYER PROFILE ERROR:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Update buyer profile
 * - Only buyers can update their own profile
 */
exports.updateProfile = async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ success: false, message: 'Only buyers can update their profile' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { name, email, password, bio, location, subcategories } = req.body;

    // Update user info if provided
    if (name) user.name = name;
    if (email && email !== user.email) {
      const existingEmailUser = await User.findOne({ email });
      if (existingEmailUser) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      user.email = email;
    }
    if (password) {
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(password, salt);
    }
    await user.save();

    // Handle avatar upload
    let avatarUrl;
    if (req.file) {
      avatarUrl = `/uploads/buyers/${req.user._id}/${req.file.filename}`;
    }

    // Update or create profile
    let profile = await BuyerProfile.findOne({ user: req.user._id });
    if (profile) {
      profile.bio = bio ?? profile.bio;
      profile.location = location ?? profile.location;
      profile.subcategories = subcategories ?? profile.subcategories;
      profile.avatar = avatarUrl ?? profile.avatar;
      await profile.save();
    } else {
      profile = await BuyerProfile.create({
        user: req.user._id,
        bio,
        location,
        subcategories,
        avatar: avatarUrl || null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      profile
    });

  } catch (error) {
    console.error('UPDATE BUYER PROFILE ERROR:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get logged-in buyer's profile
 */
exports.getProfile = async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ success: false, message: 'Only buyers can access their profile' });
    }

    const profile = await BuyerProfile.findOne({ user: req.user._id }).populate('subcategories', 'name');

    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    res.status(200).json({ success: true, profile });

  } catch (error) {
    console.error('GET BUYER PROFILE ERROR:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Delete buyer profile
 */
exports.deleteProfile = async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ success: false, message: 'Only buyers can delete their profile' });
    }

    const profile = await BuyerProfile.findOneAndDelete({ user: req.user._id });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    res.status(200).json({ success: true, message: 'Profile deleted successfully' });

  } catch (error) {
    console.error('DELETE BUYER PROFILE ERROR:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};