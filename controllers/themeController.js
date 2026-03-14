const Theme = require('../models/themeModel');


/**
 * Create Theme
 */
exports.createTheme = async (req, res) => {
  try {

    if (req.user.role !== 'admin' && req.user.role !== 'artist') {
      return res.status(403).json({
        success: false,
        message: "Only admin or artist can create theme"
      });
    }

    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required"
      });
    }

    const existing = await Theme.findOne({ name });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Theme already exists"
      });
    }

    const theme = await Theme.create({
      name,
      description
    });

    res.status(201).json({
      success: true,
      message: "Theme created successfully",
      theme
    });

  } catch (error) {
    console.error("CREATE THEME ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



/**
 * Get All Themes
 */
exports.getThemes = async (req, res) => {
  try {

    const themes = await Theme.find({ isActive: true });

    res.status(200).json({
      success: true,
      count: themes.length,
      themes
    });

  } catch (error) {
    console.error("GET THEMES ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



/**
 * Get Theme by ID
 */
exports.getThemeById = async (req, res) => {
  try {

    const theme = await Theme.findById(req.params.id);

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: "Theme not found"
      });
    }

    res.status(200).json({
      success: true,
      theme
    });

  } catch (error) {
    console.error("GET THEME ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



/**
 * Update Theme
 */
exports.updateTheme = async (req, res) => {
  try {

    if (req.user.role !== 'admin' && req.user.role !== 'artist') {
      return res.status(403).json({
        success: false,
        message: "Only admin or artist can update theme"
      });
    }

    const theme = await Theme.findById(req.params.id);

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: "Theme not found"
      });
    }

    const { name, description, isActive } = req.body;

    if (name !== undefined) theme.name = name;
    if (description !== undefined) theme.description = description;
    if (isActive !== undefined) theme.isActive = isActive;

    await theme.save();

    res.status(200).json({
      success: true,
      message: "Theme updated successfully",
      theme
    });

  } catch (error) {
    console.error("UPDATE THEME ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



/**
 * Delete Theme
 */
exports.deleteTheme = async (req, res) => {
  try {

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only admin can delete theme"
      });
    }

    const theme = await Theme.findByIdAndDelete(req.params.id);

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: "Theme not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Theme deleted successfully"
    });

  } catch (error) {
    console.error("DELETE THEME ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};