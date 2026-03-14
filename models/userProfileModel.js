const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  country: {
    type: String,
    default: ""
  },
  state: {
    type: String,
    default: ""
  },
  city: {
    type: String,
    default: ""
  },
  street: {
    type: String,
    default: ""
  },
  postalCode: {
    type: String,
    default: ""
  }
});

const userProfileSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  bio: {
    type: String,
    default: ""
  },

  phoneNumber: {
    type: String,
    default: ""
  },

  profileImage: {
    type: String,
    default: ""
  },

  address: addressSchema,

  favoriteCategories: [
    {
      type: String
    }
  ],

  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artwork"
    }
  ]

}, { timestamps: true });

module.exports = mongoose.model('UserProfile', userProfileSchema);