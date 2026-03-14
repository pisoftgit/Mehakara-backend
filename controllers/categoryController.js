const Category = require('../models/categoryModel');
const SubCategory = require("../models/subCategoryModel")
const NestedSubCategory =require("../models/nestedSubCategoryModel")

exports.createCategory = async (req, res) => {

  try {

    const { name } = req.body;

    const existing = await Category.findOne({ name });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Category already exists"
      });
    }

    const category = await Category.create({ name });

    res.status(201).json({
      success: true,
      message: "Category created",
      category
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};exports.getCategories = async (req, res) => {

  try {

    const categories = await Category.find();

    res.status(200).json({
      success: true,
      categories
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};

exports.getCategory = async (req, res) => {

  try {

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.status(200).json({
      success: true,
      category
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};

exports.updateCategory = async (req, res) => {

  try {

    const { name } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated",
      category
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};

exports.deleteCategory = async (req, res) => {

  try {

    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};

exports.getCategoriesWithSubCategories = async (req, res) => {
  try {

    const categories = await Category.aggregate([
      {
        $lookup: {
          from: 'subcategories', 
          localField: '_id',
          foreignField: 'category',
          as: 'subcategories'
        }
      },
      {
        $unwind: {
          path: '$subcategories',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'nestedsubcategories',
          localField: 'subcategories._id',
          foreignField: 'subCategory',
          as: 'subcategories.nestedSubcategories'
        }
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          subcategories: { $push: '$subcategories' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      categories
    });

  } catch (error) {
    console.error('CATEGORY TREE ERROR:', error);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};