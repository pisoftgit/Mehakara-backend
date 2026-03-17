const Inquiry = require('../models/inquiryModel');

// @desc    Submit a new inquiry
// @route   POST /api/inquiries
exports.submitInquiry = async (req, res) => {
  try {
    const { fullName, email, vision } = req.body;

    const inquiry = await Inquiry.create({
      fullName,
      email,
      vision
    });

    res.status(201).json({
      success: true,
      message: 'Your vision has been received. We will reach out soon.',
      data: inquiry
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all inquiries (Admin Only)
// @route   GET /api/inquiries
exports.getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};