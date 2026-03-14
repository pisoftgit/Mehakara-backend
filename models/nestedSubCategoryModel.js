const mongoose = require('mongoose');

const nestedSubCategorySchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },

  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory',
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model('NestedSubCategory', nestedSubCategorySchema);