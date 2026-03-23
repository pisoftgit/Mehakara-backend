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

    // Recent Artworks (6)
    const recentArtworks = await Artwork.find()
      .populate('artistId', 'name')
      .sort({ createdAt: -1 })
      .limit(6);

    // Top Artists (by revenue from orders)
    const topArtistsData = await Order.aggregate([
      { $match: { status: { $in: ['delivered', 'confirmed', 'shipped'] } } },
      { $group: { _id: '$artistId', totalRevenue: { $sum: '$totalAmount' }, salesCount: { $sum: 1 } } },
      { $sort: { totalRevenue: -1 } },
      { $limit: 4 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'artist' } },
      { $unwind: '$artist' }
    ]);

    const topArtists = topArtistsData.map(item => ({
      id: item._id,
      name: item.artist.name,
      artworks: item.salesCount, // using salesCount as representative active engagement for this stat
      sales: item.totalRevenue,
      initials: item.artist.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }));

    // Monthly Revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $in: ['delivered', 'confirmed', 'shipped'] } } },
      { $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          revenue: { $sum: '$totalAmount' }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format monthlyRevenue for the frontend (e.g., [1200, 1500, ...])
    const revenueLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueSeries = monthlyRevenue.map(item => ({
      name: revenueLabels[item._id.month - 1],
      revenue: item.revenue
    }));

    // Featured Artwork (most expensive or latest)
    const featuredArtwork = await Artwork.findOne().sort({ price: -1 }).populate('artistId', 'name');

    res.status(200).json({
      success: true,
      data: {
        totalArtworks,
        totalArtists,
        totalRevenue,
        salesThisMonth,
        recentArtworks,
        topArtists,
        revenueSeries,
        featuredArtwork
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
    
    const soldArtworksCount = await Artwork.countDocuments({ 
       $or: [{ artistId }, { artist: artistId }],
       isSold: true
    });

    const revenueData = await Order.aggregate([
      { $match: { artistId, status: { $in: ['delivered', 'confirmed', 'shipped'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    const pendingOrders = await Order.countDocuments({ artistId, status: 'pending' });

    // Recent Artworks (Artist specifically)
    const recentArtworks = await Artwork.find({
       $or: [{ artistId }, { artist: artistId }]
    }).sort({ createdAt: -1 }).limit(4);

    // Sales data (Artist specifically)
    const salesData = await Order.find({ 
      artistId, 
      status: { $in: ['delivered', 'confirmed', 'shipped'] } 
    }).populate('artworkId').populate('buyerId', 'name').sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalArtworks,
        soldArtworks: soldArtworksCount,
        totalRevenue,
        pendingOrders,
        recentArtworks,
        salesData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
