const mongoose = require('mongoose');

const buyerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  address: { type: String, trim: true },
  country: { type: String, trim: true },
  state: { type: String, trim: true },
  subcategories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory'
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('BuyerProfile', buyerProfileSchema);