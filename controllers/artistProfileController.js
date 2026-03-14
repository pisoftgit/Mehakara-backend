const ArtistProfile = require('../models/artistProfileModel');
const User = require('../models/userModel');



exports.createProfile = async (req, res) => {
  try {
    // 1️⃣ ROLE CHECK
    if (req.user.role !== 'artist' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: only artists or admins can create artist profiles' });
    }

    const artistId = (req.user.role === 'admin' && req.body.userId) ? req.body.userId : req.user._id;

    // Check if profile already exists
    const existing = await ArtistProfile.findOne({ user: artistId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Profile already exists. Use update API instead.' });
    }

    // Build profile data
    const {
      artistName,
      bio,
      country,
      state,
      education,
      qualification,
      recognition,
      website,
      socialMedia,
      categories
    } = req.body;

    // Handle uploaded images
    let uploadedImages = [];
    let avatarUrl = '';

    if (req.files) {
      if (req.files.portfolioImages && req.files.portfolioImages.length > 0) {
        uploadedImages = req.files.portfolioImages.map(file => ({
          url: `/uploads/artists/${artistId}/${file.filename}`,
          title: file.originalname,
          uploadedAt: new Date()
        }));
      }
      if (req.files.avatar && req.files.avatar.length > 0) {
        avatarUrl = `/uploads/artists/${artistId}/${req.files.avatar[0].filename}`;
      }
    }

    const profile = await ArtistProfile.create({
      user: artistId,
      artistName,
      avatar: avatarUrl,
      bio,
      country,
      state,
      education,
      qualification,
      recognition,
      website,
      socialMedia,
      categories,
      portfolioImages: uploadedImages
    });

    res.status(201).json({ success: true, message: 'Artist profile created', profile });

  } catch (error) {
    console.error('CREATE ARTIST PROFILE ERROR:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Update artist profile
 * - Only logged-in artist can update their own profile
 * - Admin can update any artist
 */
exports.updateProfile = async (req, res) => {
  try {
    if (req.user.role !== 'artist' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: only artists or admins can update artist profiles' });
    }

    const targetUserId = (req.user.role === 'admin' && req.body.userId) ? req.body.userId : req.user._id;

    // Artists cannot update other artist profiles
    if (req.user.role === 'artist' && targetUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: cannot update other artists' });
    }

    const user = await User.findById(targetUserId);
    if (!user || user.role !== 'artist') {
      return res.status(404).json({ success: false, message: 'Artist user not found' });
    }

    const profile = await ArtistProfile.findOne({ user: targetUserId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Artist profile not found' });
    }

    const {
      artistName,
      bio,
      country,
      state,
      education,
      qualification,
      recognition,
      website,
      socialMedia,
      categories
    } = req.body;

    if (artistName) {
      profile.artistName = artistName;
      user.name = artistName;
      await user.save();
    }
    if (bio) profile.bio = bio;
    if (country) profile.country = country;
    if (state) profile.state = state;
    if (education) profile.education = education;
    if (qualification) profile.qualification = qualification;
    if (recognition) profile.recognition = recognition;
    if (website) profile.website = website;
    if (socialMedia) profile.socialMedia = socialMedia;
    if (categories) profile.categories = categories;

    // Handle portfolio images and avatar
    if (req.files) {
      if (req.files.portfolioImages && req.files.portfolioImages.length > 0) {
        const uploadedImages = req.files.portfolioImages.map(file => ({
          url: `/uploads/artists/${targetUserId}/${file.filename}`,
          title: file.originalname,
          uploadedAt: new Date()
        }));
        profile.portfolioImages.push(...uploadedImages);
      }
      if (req.files.avatar && req.files.avatar.length > 0) {
        profile.avatar = `/uploads/artists/${targetUserId}/${req.files.avatar[0].filename}`;
      }
    }

    await profile.save();

    res.status(200).json({ success: true, message: 'Artist profile updated', profile });

  } catch (error) {
    console.error('UPDATE ARTIST PROFILE ERROR:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get own artist profile
 */
exports.getProfile = async (req, res) => {
  try {
    if (req.user.role !== 'artist') {
      return res.status(403).json({ success: false, message: 'Forbidden: only artists can access their profile' });
    }

    const profile = await ArtistProfile.findOne({ user: req.user._id }).populate('categories', 'name');

    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    res.status(200).json({ success: true, profile });

  } catch (error) {
    console.error('GET ARTIST PROFILE ERROR:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get artist profile by ID (admin/public)
 */
exports.getProfileById = async (req, res) => {
  try {
    const profile = await ArtistProfile.findOne({ user: req.params.userId }).populate('categories', 'name');

    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    res.status(200).json({ success: true, profile });

  } catch (error) {
    console.error('GET ARTIST PROFILE BY ID ERROR:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Delete artist profile
 */
exports.deleteProfile = async (req, res) => {
  try {
    const targetUserId = req.user._id;

    if (req.user.role !== 'artist') {
      return res.status(403).json({ success: false, message: 'Forbidden: only artists can delete their profile' });
    }

    const profile = await ArtistProfile.findOneAndDelete({ user: targetUserId });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    res.status(200).json({ success: true, message: 'Artist profile deleted successfully' });

  } catch (error) {
    console.error('DELETE ARTIST PROFILE ERROR:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};