const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  minArea: {
    type: Number,
    required: true
  },

  maxArea: {
    type: Number,
    required: true
  },

  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Unit",
    required: true
  },

  description: {
    type: String
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Size", sizeSchema);