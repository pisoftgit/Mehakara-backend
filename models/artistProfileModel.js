const mongoose = require('mongoose');

const artistProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  artistName: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 2000,
  },
  country: { type: String, trim: true },
  state: { type: String, trim: true },
  address: { type: String, trim: true },
  deliveryLocations: [
    {
      country: { type: String, trim: true },
      states: [String],
    }
  ],
  education: { type: String, trim: true },
  qualification: { type: String, trim: true },
  recognition: { type: String, trim: true },
  website: { type: String, trim: true },
  socialMedia: {
    instagram: { type: String, trim: true },
    facebook: { type: String, trim: true },
    twitter: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    other: [String],
  },
  portfolioImages: [
    {
      url: { type: String },
      title: { type: String, trim: true },
      description: { type: String, trim: true },
      uploadedAt: { type: Date, default: Date.now },
    }
  ],
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
    }
  ],
}, {
  timestamps: true // automatically creates createdAt and updatedAt
});

module.exports = mongoose.model('ArtistProfile', artistProfileSchema);