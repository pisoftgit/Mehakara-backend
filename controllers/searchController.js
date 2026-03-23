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
    const isArtist = req.user.role === 'artist';
    const isAdmin = req.user.role === 'admin';

    // Search Artworks
    const artworkQuery = {
      $or: [
        { title: searchRegex },
        { artworkCode: searchRegex },
      ],
    };
    if (isArtist) {
      artworkQuery.artist = req.user._id;
    }

    const artworks = await Artwork.find(artworkQuery)
      .limit(5)
      .select('title artworkCode images price currency');

    // Search Users (Artists and regular users)
    // For admin: search all users. 
    // For artists: search other artists or potential buyers? 
    // Let's allow searching all for name, but admin gets email too.
    const users = await User.find({
      $or: [
        { name: searchRegex },
        { email: searchRegex },
      ],
    })
      .limit(5)
      .select(isAdmin ? 'name email role' : 'name role');

    // Search Orders
    const orderQuery = {
      $or: [
        { orderId: searchRegex },
        { 'shippingAddress.name': searchRegex },
      ],
    };
    if (isArtist) {
      orderQuery.artistId = req.user._id;
    }

    const orders = await Order.find(orderQuery)
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
