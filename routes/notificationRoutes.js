const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationById,
  sendAdminNotification
} = require('../controllers/notificationController');

// Send notification from Admin/SuperAdmin to Artist (email + in-app)
router.post('/send-to-artist', protect, sendAdminNotification);

// Get all notifications for current user
router.get('/', protect, getUserNotifications);

// Get unread count
router.get('/unread/count', protect, getUnreadCount);

// Get single notification (also marks as read)
router.get('/:id', protect, getNotificationById);

// Mark notification as read
router.patch('/:id/read', protect, markAsRead);

// Mark all notifications as read
router.patch('/read/all', protect, markAllAsRead);

// Delete notification
router.delete('/:id', protect, deleteNotification);

// Delete all notifications
router.delete('/all', protect, deleteAllNotifications);

module.exports = router;
