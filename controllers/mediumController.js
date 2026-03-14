const Medium = require('../models/mediumModel');


/**
 * Create Medium
 * Admin & Artist allowed
 */
exports.createMedium = async (req, res) => {
  try {

    if (req.user.role !== 'admin' && req.user.role !== 'artist') {
      return res.status(403).json({
        success: false,
        message: "Only admin or artist can create medium"
      });
    }

    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required"
      });
    }

    const existing = await Medium.findOne({ name });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Medium already exists"
      });
    }

    const medium = await Medium.create({
      name,
      description
    });

    res.status(201).json({
      success: true,
      message: "Medium created successfully",
      medium
    });

  } catch (error) {
    console.error("CREATE MEDIUM ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



/**
 * Get All Mediums
 */
exports.getMediums = async (req, res) => {
  try {

    const mediums = await Medium.find({ isActive: true });

    res.status(200).json({
      success: true,
      count: mediums.length,
      mediums
    });

  } catch (error) {
    console.error("GET MEDIUMS ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



/**
 * Get Medium By ID
 */
exports.getMediumById = async (req, res) => {
  try {

    const medium = await Medium.findById(req.params.id);

    if (!medium) {
      return res.status(404).json({
        success: false,
        message: "Medium not found"
      });
    }

    res.status(200).json({
      success: true,
      medium
    });

  } catch (error) {
    console.error("GET MEDIUM ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



/**
 * Update Medium
 */
exports.updateMedium = async (req, res) => {
  try {

    if (req.user.role !== 'admin' && req.user.role !== 'artist') {
      return res.status(403).json({
        success: false,
        message: "Only admin or artist can update medium"
      });
    }

    const medium = await Medium.findById(req.params.id);

    if (!medium) {
      return res.status(404).json({
        success: false,
        message: "Medium not found"
      });
    }

    const { name, description, isActive } = req.body;

    if (name !== undefined) medium.name = name;
    if (description !== undefined) medium.description = description;
    if (isActive !== undefined) medium.isActive = isActive;

    await medium.save();

    res.status(200).json({
      success: true,
      message: "Medium updated successfully",
      medium
    });

  } catch (error) {
    console.error("UPDATE MEDIUM ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



/**
 * Delete Medium
 */
exports.deleteMedium = async (req, res) => {
  try {

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only admin can delete medium"
      });
    }

    const medium = await Medium.findByIdAndDelete(req.params.id);

    if (!medium) {
      return res.status(404).json({
        success: false,
        message: "Medium not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Medium deleted successfully"
    });

  } catch (error) {
    console.error("DELETE MEDIUM ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};