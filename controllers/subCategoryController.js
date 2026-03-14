const SubCategory = require('../models/subCategoryModel');
const Category = require('../models/categoryModel');


/* CREATE SUBCATEGORY */

exports.createSubCategory = async (req, res) => {

  try {

    const { name, category } = req.body;

    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    const subCategory = await SubCategory.create({
      name,
      category
    });

    res.status(201).json({
      success: true,
      message: "Subcategory created",
      subCategory
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};


/* GET ALL SUBCATEGORIES */

exports.getSubCategories = async (req, res) => {

  try {

    const { category } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    const subCategories = await SubCategory.find(query)
      .populate('category', 'name');

    res.status(200).json({
      success: true,
      subCategories
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};


/* GET SINGLE SUBCATEGORY */

exports.getSubCategory = async (req, res) => {

  try {

    const subCategory = await SubCategory.findById(req.params.id)
      .populate('category', 'name');

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found"
      });
    }

    res.status(200).json({
      success: true,
      subCategory
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};


/* UPDATE SUBCATEGORY */

exports.updateSubCategory = async (req, res) => {

  try {

    const { name, category } = req.body;

    const subCategory = await SubCategory.findByIdAndUpdate(
      req.params.id,
      { name, category },
      { new: true }
    );

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Subcategory updated",
      subCategory
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};


/* DELETE SUBCATEGORY */

exports.deleteSubCategory = async (req, res) => {

  try {

    const subCategory = await SubCategory.findByIdAndDelete(req.params.id);

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Subcategory deleted"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};