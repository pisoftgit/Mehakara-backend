const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const sendEmail = require('../utils/sendEmail');

// Send notification from Admin/SuperAdmin to Artist (via email and in-app)
exports.sendAdminNotification = async (req, res) => {
  try {
    // Check if user is admin or superadmin
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only admin or superadmin can send notifications'
      });
    }

    const { recipientId, title, message, type, orderId, offerId, bidId } = req.body;

    // Validate required fields
    if (!recipientId || !title || !message || !type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: recipientId, title, message, type'
      });
    }

    // Get recipient (artist) details
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // Create notification record
    const notificationData = {
      recipientId,
      type,
      title,
      message,
      isRead: false
    };

    // Add optional references
    if (orderId) notificationData.orderId = orderId;
    if (offerId) notificationData.offerId = offerId;
    if (bidId) notificationData.bidId = bidId;
    notificationData.relatedUserId = req.user._id; // Admin who sent the notification

    const notification = await Notification.create(notificationData);

    // Send email to artist
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="margin: 0; color: #333;">${title}</h2>
            </div>
            
            <div style="padding: 20px; background-color: #fff;">
              <p>${message}</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
              <p>Best regards,<br/>Mehakara Admin Team</p>
            </div>
          </div>
        </div>
      `;

      await sendEmail({
        email: recipient.email,
        subject: title,
        message: message,
        html: emailHtml
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Continue even if email fails - notification is already created in DB
    }

    res.status(201).json({
      success: true,
      message: 'Notification sent successfully to artist',
      data: notification
    });
  } catch (error) {
    console.error('Send admin notification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error sending notification'
    });
  }
};

// Get all notifications for current user
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ recipientId: userId })
      .populate('orderId')
      .populate('artworkId', 'title images')
      .populate('relatedUserId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching notifications'
    });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const count = await Notification.countDocuments({
      recipientId: userId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching unread count'
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    ).populate('orderId').populate('artworkId').populate('relatedUserId');

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error marking notification as read'
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error marking notifications as read'
    });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting notification'
    });
  }
};

// Delete all notifications
exports.deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.deleteMany({ recipientId: userId });

    res.status(200).json({
      success: true,
      message: 'All notifications deleted',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting notifications'
    });
  }
};

// Get single notification
exports.getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    ).populate('orderId').populate('artworkId').populate('relatedUserId');

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching notification'
    });
  }
};
