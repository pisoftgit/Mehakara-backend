const Artwork = require('../models/artworkModel');
const User = require('../models/userModel');
const Order = require('../models/orderModel');

/**
 * @desc    Master search across artworks, users, and orders
 * @route   GET /api/search
 * @access  Private/Admin/Artist
 */
exports.masterSearch = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(200).json({
        artworks: [],
        users: [],
        orders: [],
      });
    }

    const searchRegex = new RegExp(query, 'i');

    // Search Artworks
    const artworks = await Artwork.find({
      $or: [
        { title: searchRegex },
        { artworkCode: searchRegex },
      ],
    })
      .limit(5)
      .select('title artworkCode images price currency');

    // Search Users (Artists and regular users)
    const users = await User.find({
      $or: [
        { name: searchRegex },
        { email: searchRegex },
      ],
    })
      .limit(5)
      .select('name email role');

    // Search Orders
    const orders = await Order.find({
      $or: [
        { orderId: searchRegex },
        { 'shippingAddress.name': searchRegex },
      ],
    })
      .limit(5)
      .select('orderId status totalAmount');

    res.status(200).json({
      artworks,
      users,
      orders,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Error performing search', error: error.message });
  }
};
