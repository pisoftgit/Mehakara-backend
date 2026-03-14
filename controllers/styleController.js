const Style = require('../models/styleModel');


/**
 * Create Style
 */
exports.createStyle = async (req, res) => {
  try {

    if (req.user.role !== 'admin' && req.user.role !== 'artist') {
      return res.status(403).json({
        success: false,
        message: "Only admin or artist can create style"
      });
    }

    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required"
      });
    }

    const existing = await Style.findOne({ name });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Style already exists"
      });
    }

    const style = await Style.create({
      name,
      description
    });

    res.status(201).json({
      success: true,
      message: "Style created successfully",
      style
    });

  } catch (error) {
    console.error("CREATE STYLE ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



/**
 * Get All Styles
 */
exports.getStyles = async (req, res) => {
  try {

    const styles = await Style.find({ isActive: true });

    res.status(200).json({
      success: true,
      count: styles.length,
      styles
    });

  } catch (error) {
    console.error("GET STYLES ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



/**
 * Get Style By ID
 */
exports.getStyleById = async (req, res) => {
  try {

    const style = await Style.findById(req.params.id);

    if (!style) {
      return res.status(404).json({
        success: false,
        message: "Style not found"
      });
    }

    res.status(200).json({
      success: true,
      style
    });

  } catch (error) {
    console.error("GET STYLE ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



/**
 * Update Style
 */
exports.updateStyle = async (req, res) => {
  try {

    if (req.user.role !== 'admin' && req.user.role !== 'artist') {
      return res.status(403).json({
        success: false,
        message: "Only admin or artist can update style"
      });
    }

    const style = await Style.findById(req.params.id);

    if (!style) {
      return res.status(404).json({
        success: false,
        message: "Style not found"
      });
    }

    const { name, description, isActive } = req.body;

    if (name !== undefined) style.name = name;
    if (description !== undefined) style.description = description;
    if (isActive !== undefined) style.isActive = isActive;

    await style.save();

    res.status(200).json({
      success: true,
      message: "Style updated successfully",
      style
    });

  } catch (error) {
    console.error("UPDATE STYLE ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



/**
 * Delete Style
 */
exports.deleteStyle = async (req, res) => {
  try {

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only admin can delete style"
      });
    }

    const style = await Style.findByIdAndDelete(req.params.id);

    if (!style) {
      return res.status(404).json({
        success: false,
        message: "Style not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Style deleted successfully"
    });

  } catch (error) {
    console.error("DELETE STYLE ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};