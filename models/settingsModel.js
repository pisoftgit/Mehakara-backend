const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  heroTagline: { type: String, default: "" },
  heroDescription: { type: String, default: "" },
  heroImage: { type: String, default: "" },
  storyVideo1: { type: String, default: "" },
  storyVideo2: { type: String, default: "" },
  aboutHero: {
    experience: { type: String, default: "" },
    goal: { type: String, default: "" },
    mainImage: { type: String, default: "" },
    floatImage1: { type: String, default: "" },
    floatImage2: { type: String, default: "" }
  },
  aboutPhilosophy: {
    title: { type: String, default: "" },
    philosophyText: { type: String, default: "" },
    philosophyQuote: { type: String, default: "" },
    philosophyImage: { type: String, default: "" }
  },
  aboutStats: [
    {
      label: { type: String, default: "" },
      value: { type: String, default: "" }
    }
  ],
  // settingsModel.js
  artistStory: [
    {
      time: { type: Number, default: 0 },
      title: { type: String, default: "" },
      text: { type: String, default: "" }
    }
  ],

  // settingsModel.js
  aboutStats: [{ label: String, value: String }],
  aboutApproach: {
    mainImage: { type: String, default: "" },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    points: [{ title: String, text: String }]
  },
  contactData: {
    name: { type: String, default: "" },
    logo: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    contactNumbers: [{ label: String, number: String }],
    socialLinks: [{ platform: String, url: String }] 
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);