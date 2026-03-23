const Artwork = require('../models/artworkModel');
const User = require('../models/userModel');
const Order = require('../models/orderModel');

// --- 1. ADMIN STATS ---
exports.getAdminStats = async (req, res) => {
  try {
    const totalArtworks = await Artwork.countDocuments();
    const totalArtists = await User.countDocuments({ role: 'artist' });
    
    // Total Revenue (Delivered/Confirmed Orders)
    const revenueData = await Order.aggregate([
      { $match: { status: { $in: ['delivered', 'confirmed', 'shipped'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Sales this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const salesThisMonth = await Order.countDocuments({
      createdAt: { $gte: startOfMonth },
      status: { $ne: 'cancelled' }
    });

    res.status(200).json({
      success: true,
      data: {
        totalArtworks,
        totalArtists,
        totalRevenue,
        salesThisMonth
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 2. ARTIST STATS ---
exports.getArtistStats = async (req, res) => {
  try {
    const artistId = req.user._id;

    const totalArtworks = await Artwork.countDocuments({ 
       $or: [{ artistId }, { artist: artistId }] 
    });
    
    const soldArtworks = await Artwork.countDocuments({ 
       $or: [{ artistId }, { artist: artistId }],
       isSold: true
    });

    const revenueData = await Order.aggregate([
      { $match: { artistId, status: { $in: ['delivered', 'confirmed', 'shipped'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    const pendingOrders = await Order.countDocuments({ artistId, status: 'pending' });

    res.status(200).json({
      success: true,
      data: {
        totalArtworks,
        soldArtworks,
        totalRevenue,
        pendingOrders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
