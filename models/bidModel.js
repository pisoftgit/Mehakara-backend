const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
  {
    artworkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artwork',
      required: true
    },
    bidderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bidAmount: {
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
    // Converted price in artwork's base currency for sorting/comparison
    convertedAmount: {
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
      enum: ['active', 'outbid', 'won', 'lost', 'cancelled'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

// Add index for faster sorting of bids per artwork
bidSchema.index({ artworkId: 1, 'convertedAmount.amount': -1 });

module.exports = mongoose.model('Bid', bidSchema);
