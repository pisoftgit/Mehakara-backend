const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
      default: () => 'ORD-' + Date.now()
    },

    artworkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artwork',
      required: true
    },

    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    quantity: {
      type: Number,
      default: 1,
      required: true
    },

    price: {
      amount: {
        type: Number,
        required: true
      },
      currency: {
        type: String,
        default: 'USD'
      }
    },

    totalAmount: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ['pending', 'offered', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },

    isOffer: {
      type: Boolean,
      default: false
    },

    proposedPrice: {
      type: Number
    },

    originalPrice: {
      type: Number
    },

    shippingAddress: {
      name: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },

    notes: String,

    trackingNumber: String,

    deliveryOTP: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', orderSchema);
