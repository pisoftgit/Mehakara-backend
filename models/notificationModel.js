const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    type: {
      type: String,
      enum: [
        'order_created',
        'order_confirmed',
        'order_shipped',
        'order_delivered',
        'order_cancelled',
        'artwork_purchased',
        'offer_received',
        'offer_accepted',
        'offer_rejected'
      ],
      required: true
    },

    title: {
      type: String,
      required: true
    },

    message: {
      type: String,
      required: true
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },

    artworkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artwork'
    },

    relatedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    isRead: {
      type: Boolean,
      default: false
    },

    actionUrl: String
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
