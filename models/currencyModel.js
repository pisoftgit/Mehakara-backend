const mongoose = require('mongoose');

const currencySchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  symbol: {
    type: String,
    required: true,
    trim: true
  },
  exchangeRate: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  flag: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster lookups
currencySchema.index({ isActive: 1 });

module.exports = mongoose.model('Currency', currencySchema);