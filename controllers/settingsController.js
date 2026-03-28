const Settings = require('../models/settingsModel');

/**
 * @desc    Get Settings document
 */
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Partial Update Settings
 */
exports.updateSettings = async (req, res) => {
  try {
    // We use $set to only update the fields sent from the frontend
    const updatedSettings = await Settings.findOneAndUpdate(
      {}, 
      { $set: req.body }, 
      { new: true, upsert: true, runValidators: true }
    );
    res.status(200).json({ success: true, data: updatedSettings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Upload Media with size enforcement
 */
exports.uploadMedia = async (req, res) => {
  try {
    // Multer handles the file saving before this function runs.
    // If the file is too big, it usually goes to the global error handler,
    // but we can check here as a fallback.
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded or file too large." });
    }

    const webPath = `/${req.file.path.replace(/\\/g, '/')}`;

    res.status(200).json({
      success: true,
      message: "Media synchronized to about-home folder",
      url: webPath
    });
  } catch (error) {
    // Handle Multer-specific errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: "File is too large. Max limit is 300KB." });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};