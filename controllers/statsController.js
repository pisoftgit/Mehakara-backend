const Artwork = require('../models/artworkModel');
const User = require('../models/userModel');
const Order = require('../models/orderModel');

exports.getAdminStats = async (req, res) => {
  try {
    const totalArtworks = await Artwork.countDocuments();
    const totalArtists = await User.countDocuments({ role: 'artist' });
    
    const orders = await Order.find({ status: 'delivered' });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Get recent artworks
    const recentArtworks = await Artwork.find()
      .populate('artistId', 'name')
      .sort({ createdAt: -1 })
      .limit(6);

    // Get highest value listing
    const featuredArtwork = await Artwork.findOne()
      .populate('artistId', 'name')
      .sort({ price: -1 });

    res.status(200).json({
      success: true,
      data: {
        totalArtworks,
        totalArtists,
        totalRevenue,
        salesThisMonth: orders.length,
        recentArtworks,
        featuredArtwork,
        revenueSeries: [
          { name: "Jan", revenue: 4000 },
          { name: "Feb", revenue: 3000 },
          { name: "Mar", revenue: 5000 },
          { name: "Apr", revenue: 4500 },
          { name: "May", revenue: 6000 },
          { name: "Jun", revenue: 5500 },
        ],
        topArtists: [
          { id: 1, name: "Mehakara Studio", initials: "MS", artworks: 12, sales: 8500 },
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getArtistStats = async (req, res) => {
  try {
    const totalArtworks = await Artwork.countDocuments({ artistId: req.user._id });
    const orders = await Order.find({ 'items.artistId': req.user._id, status: 'delivered' });
    const totalEarnings = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    res.status(200).json({
      success: true,
      data: {
        totalArtworks,
        totalEarnings,
        totalSales: orders.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
