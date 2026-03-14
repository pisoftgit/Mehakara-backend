const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  symbol: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model('Unit', unitSchema);