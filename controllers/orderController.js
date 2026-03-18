const Order = require('../models/orderModel');
const Notification = require('../models/notificationModel');
const Artwork = require('../models/artworkModel');
const User = require('../models/userModel');

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const {
      artworkId,
      quantity,
      shippingAddress,
      notes,
      isOffer,
      proposedPrice
    } = req.body;

    const buyerId = req.user._id;

    // Get artwork details
    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      });
    }

    const artistId = artwork.artistId || artwork.artist;
    const originalPrice = artwork.price;

    // Prevent artist from ordering their own artwork
    if (artistId.toString() === buyerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You cannot place an order on your own artwork'
      });
    }

    // Reject orders for artworks marked as unavailable
    if (!artwork.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'This artwork is not available for purchase'
      });
    }
    
    // Security check: Only apply negotiated price if there's a valid accepted offer
    let finalPrice = originalPrice;
    
    // Check if there is an accepted offer for this buyer and artwork
    const Offer = require('../models/offerModel');
    const acceptedOffer = await Offer.findOne({
      artworkId,
      buyerId,
      status: 'accepted'
    });

    if (acceptedOffer) {
      finalPrice = acceptedOffer.proposedPrice;
    } else if (proposedPrice && isOffer) {
      finalPrice = Number(proposedPrice);
    }
    
    const totalAmount = finalPrice * quantity;

    // Create order
    const order = new Order({
      artworkId,
      artistId,
      buyerId,
      quantity,
      price: {
        amount: finalPrice,
        currency: 'USD'
      },
      totalAmount,
      shippingAddress,
      notes,
      isOffer: !!isOffer,
      proposedPrice: isOffer ? Number(proposedPrice) : undefined,
      originalPrice,
      status: isOffer ? 'offered' : 'pending'
    });

    await order.save();
    
    // If it was from an accepted offer, mark the offer as completed
    if (acceptedOffer) {
      acceptedOffer.status = 'completed';
      await acceptedOffer.save();
    }

    // Create notification for artist
    await Notification.create({
      recipientId: artistId,
      type: 'order_created',
      title: 'New Order Received',
      message: `You received a new order for "${artwork.title}"`,
      orderId: order._id,
      artworkId,
      relatedUserId: buyerId,
      actionUrl: `/artist-orders/${order._id}`
    });

    // Create notification for admin
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        recipientId: admin._id,
        type: 'order_created',
        title: 'New Order',
        message: `New order received for "${artwork.title}"`,
        orderId: order._id,
        artworkId,
        relatedUserId: buyerId,
        actionUrl: `/admin-orders/${order._id}`
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating order'
    });
  }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('artworkId')
      .populate('artistId', 'name email')
      .populate('buyerId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching orders'
    });
  }
};

// Get artist's orders
exports.getArtistOrders = async (req, res) => {
  try {
    const artistId = req.user._id;

    const orders = await Order.find({ artistId })
      .populate('artworkId')
      .populate('buyerId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get artist orders error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching orders'
    });
  }
};

// Get buyer's orders
exports.getBuyerOrders = async (req, res) => {
  try {
    const buyerId = req.user._id;

    const orders = await Order.find({ buyerId })
      .populate('artworkId')
      .populate('artistId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get buyer orders error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching orders'
    });
  }
};

// Get single order
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('artworkId')
      .populate('artistId', 'name email')
      .populate('buyerId', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching order'
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      {
        status,
        ...(trackingNumber && { trackingNumber })
      },
      { new: true }
    ).populate('artworkId').populate('artistId').populate('buyerId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Create notification for buyer
    await Notification.create({
      recipientId: order.buyerId._id,
      type: `order_${status}`,
      title: `Order ${status}`,
      message: `Your order for "${order.artworkId.title}" has been ${status}`,
      orderId: order._id,
      artworkId: order.artworkId._id,
      relatedUserId: order.artistId._id,
      actionUrl: `/my-orders/${order._id}`
    });

    // Create notification for artist if not pending
    if (status !== 'pending') {
      await Notification.create({
        recipientId: order.artistId._id,
        type: `order_${status}`,
        title: `Order ${status}`,
        message: `Your order for "${order.artworkId.title}" has been ${status}`,
        orderId: order._id,
        artworkId: order.artworkId._id,
        relatedUserId: order.buyerId._id,
        actionUrl: `/artist-orders/${order._id}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating order'
    });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting order'
    });
  }
};
