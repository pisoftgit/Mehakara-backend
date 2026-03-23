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
      artistStory: settingsMap.artistStory || [
        { time: 0, title: "Essence of Aurora", text: "Fluid art that flows like the first light of dawn." },
        { time: 4, title: "Where Colour Breathes", text: "Shimmering metallic gold meets dreamy pastel skies." },
        { time: 8, title: "Art With a Soul", text: "Four canvases. One radiant essence." },
        { time: 12, title: "Bring It Home", text: "Own a piece of Mehakāra and let art live in your space." }
      ],
      storyVideo1: settingsMap.storyVideo1 || "/bannerVideo.mp4",
      storyVideo2: settingsMap.storyVideo2 || "/bannerVideo2.mp4",
      
      // About Page Defaults
      aboutHero: settingsMap.aboutHero || {
        experience: "20 years of global architectural storytelling and award-winning projects.",
        goal: "Transforming visions into timeless designs with high-end precision.",
        mainImage: "/images/Mehak.png",
        floatImage1: "/images/sun.png",
        floatImage2: "/images/echoes.png"
      },
      aboutStats: settingsMap.aboutStats || [
        { label: 'Years', value: '12' },
        { label: 'Clients', value: '10k+' },
        { label: 'Global', value: '32+' },
        { label: 'Sales', value: '124k+' }
      ],
      aboutPhilosophy: settingsMap.aboutPhilosophy || {
        title: "THE POETIC NATURE OF DESIGN",
        philosophyText: "Design is the bridge between the digital soul and the physical world.",
        philosophyQuote: "Innovation is our only tradition.",
        philosophyImage: "/images/echoes.png"
      },
      aboutApproach: settingsMap.aboutApproach || {
        mainImage: "/images/sun.png",
        title: "Emotional Geometry",
        subtitle: "Every project begins with a silence. We listen to the space until it tells us what it needs to become.",
        points: [
          { title: "Conceptual Purity", text: "Stripping away the noise to find the core essence of every structure we build. Purity is the perfect arrangement of detail." },
          { title: "Digital Evolution", text: "Blending traditional craftsmanship with the infinite possibilities of the digital realm to create spaces that breathe." }
        ]
      },

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

exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const filePath = `uploads/settings/${req.file.filename}`;
    res.status(200).json({ 
      success: true, 
      message: "Media uploaded", 
      url: `/` + filePath.replace(/\\/g, '/')
    });
  } catch (error) {
    console.error("Media Upload Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
