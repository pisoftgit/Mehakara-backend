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
    proposedPrice: {
      type: Number,
      required: true
    },
    originalPrice: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending'
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
