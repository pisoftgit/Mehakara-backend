const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    artworkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artwork',
      required: true
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Buyer's offered price in their selected currency
    proposedPrice: {
      amount: {
        type: Number,
        required: true
      },
      currency: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
      }
    },
    // Converted price in artwork's original currency
    convertedPrice: {
      amount: {
        type: Number,
        required: true
      },
      currency: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
      }
    },
    // Original artwork price (for reference)
    originalPrice: {
      amount: {
        type: Number,
        required: true
      },
      currency: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
      }
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending'
    },
    declineReason: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    shippingAddress: {
      address: String,
      city: String,
      zipCode: String,
      country: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Offer', offerSchema);
