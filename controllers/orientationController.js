const Orientation = require('../models/orientationModel');


/**
 * Create Orientation
 * Admin & Artist allowed
 */
exports.createOrientation = async (req, res) => {
  try {

    if (req.user.role !== 'admin' && req.user.role !== 'artist') {
      return res.status(403).json({
        success: false,
        message: "Only admin or artist can create orientation"
      });
    }

    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required"
      });
    }

    const existing = await Orientation.findOne({ name });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Orientation already exists"
      });
    }

    const orientation = await Orientation.create({
      name,
      description
    });

    res.status(201).json({
      success: true,
      message: "Orientation created successfully",
      orientation
    });

  } catch (error) {
    console.error("CREATE ORIENTATION ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



/**
 * Get All Orientations
 */
exports.getOrientations = async (req, res) => {
  try {

    const orientations = await Orientation.find({ isActive: true });

    res.status(200).json({
      success: true,
      count: orientations.length,
      orientations
    });

  } catch (error) {
    console.error("GET ORIENTATIONS ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



/**
 * Get Orientation by ID
 */
exports.getOrientationById = async (req, res) => {
  try {

    const orientation = await Orientation.findById(req.params.id);

    if (!orientation) {
      return res.status(404).json({
        success: false,
        message: "Orientation not found"
      });
    }

    res.status(200).json({
      success: true,
      orientation
    });

  } catch (error) {
    console.error("GET ORIENTATION ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



/**
 * Update Orientation
 */
exports.updateOrientation = async (req, res) => {
  try {

    if (req.user.role !== 'admin' && req.user.role !== 'artist') {
      return res.status(403).json({
        success: false,
        message: "Only admin or artist can update orientation"
      });
    }

    const orientation = await Orientation.findById(req.params.id);

    if (!orientation) {
      return res.status(404).json({
        success: false,
        message: "Orientation not found"
      });
    }

    const { name, description, isActive } = req.body;

    if (name !== undefined) orientation.name = name;
    if (description !== undefined) orientation.description = description;
    if (isActive !== undefined) orientation.isActive = isActive;

    await orientation.save();

    res.status(200).json({
      success: true,
      message: "Orientation updated successfully",
      orientation
    });

  } catch (error) {
    console.error("UPDATE ORIENTATION ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



/**
 * Delete Orientation
 */
exports.deleteOrientation = async (req, res) => {
  try {

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only admin can delete orientation"
      });
    }

    const orientation = await Orientation.findByIdAndDelete(req.params.id);

    if (!orientation) {
      return res.status(404).json({
        success: false,
        message: "Orientation not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Orientation deleted successfully"
    });

  } catch (error) {
    console.error("DELETE ORIENTATION ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};