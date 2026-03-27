const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Collection title is required"],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  artworks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Artwork"
  }],
  coverImage: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Collection", collectionSchema);
