const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  createOrder,
  getAllOrders,
  getArtistOrders,
  getBuyerOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder
} = require('../controllers/orderController');

// Create order
router.post('/', protect, createOrder);

// Get all orders (admin only)
router.get('/admin/all', protect, getAllOrders);

// Get artist's orders
router.get('/artist/my-orders', protect, getArtistOrders);

// Get buyer's orders
router.get('/buyer/my-orders', protect, getBuyerOrders);

// Get single order
router.get('/:id', protect, getOrderById);

// Update order status (admin & artist)
router.patch('/:id/status', protect, updateOrderStatus);

// Delete order
router.delete('/:id', protect, deleteOrder);

module.exports = router;
