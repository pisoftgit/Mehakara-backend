const NestedSubCategory = require('../models/nestedSubCategoryModel');

exports.createNestedSubCategory = async (req, res) => {

  try {

    const { name, category, subCategory } = req.body;

    const nested = await NestedSubCategory.create({
      name,
      category,
      subCategory
    });

    res.status(201).json({
      success: true,
      nestedSubCategory: nested
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};


exports.getNestedSubCategories = async (req, res) => {

  try {

    const { subCategory } = req.query;
    let query = {};

    if (subCategory) {
      query.subCategory = subCategory;
    }

    const nested = await NestedSubCategory.find(query)
      .populate('category', 'name')
      .populate('subCategory', 'name');

    res.status(200).json({
      success: true,
      nestedSubCategories: nested
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};


exports.updateNestedSubCategory = async (req, res) => {

  try {

    const nested = await NestedSubCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      nestedSubCategory: nested
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};

exports.deleteNestedSubCategory = async (req, res) => {

  try {

    await NestedSubCategory.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Nested subcategory deleted"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};