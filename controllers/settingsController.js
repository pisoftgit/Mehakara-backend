const Settings = require('../models/settingsModel');

// --- 1. GET ALL SETTINGS ---
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.find();
    // Convert array to a key-value object for easier frontend consumption
    const settingsMap = {};
    settings.forEach(s => settingsMap[s.key] = s.value);
    
    // Provide default values if not set
    const finalSettings = {
      heroTagline: settingsMap.heroTagline || "Bring the Soul of Fine Art Into Your Space.",
      heroDescription: settingsMap.heroDescription || "Explore a curated collection of original masterpieces at Mehakāra gallery. From contemporary abstracts to timeless textures, find the piece that speaks to your story.",
      ...settingsMap
    };

    res.status(200).json({ success: true, data: finalSettings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- 2. UPDATE SETTINGS (ADMIN) ---
exports.updateSettings = async (req, res) => {
  try {
    const { settings } = req.body; // Expecting an object: { heroTagline: '...', ... }
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid settings data' });
    }

    const updatePromises = Object.entries(settings).map(([key, value]) => {
      return Settings.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true }
      );
    });

    await Promise.all(updatePromises);

    res.status(200).json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
