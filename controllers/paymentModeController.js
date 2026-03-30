// controllers/paymentModeController.js

const PaymentMode = require("../models/paymentModeModel");

/* CREATE */
exports.createPaymentMode = async (req, res) => {
  try {
    const { name, code } = req.body;

    const exists = await PaymentMode.findOne({ code });
    if (exists) {
      return res.status(400).json({ success: false, message: "Code already exists" });
    }

    const mode = await PaymentMode.create({ name, code });

    res.status(201).json({
      success: true,
      message: "Payment mode created",
      mode
    });
  } catch (error) {
    console.error("CREATE ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* GET ALL (ADMIN) */
exports.getAllPaymentModes = async (req, res) => {
  try {
    const modes = await PaymentMode.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      modes
    });
  } catch (error) {
    console.error("GET ALL ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* GET SINGLE */
exports.getPaymentModeById = async (req, res) => {
  try {
    const mode = await PaymentMode.findById(req.params.id);

    if (!mode) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.status(200).json({
      success: true,
      mode
    });
  } catch (error) {
    console.error("GET ONE ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* UPDATE */
exports.updatePaymentMode = async (req, res) => {
  try {
    const { name, code, isActive } = req.body;

    const mode = await PaymentMode.findById(req.params.id);

    if (!mode) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    if (code && code !== mode.code) {
      const exists = await PaymentMode.findOne({ code });
      if (exists) {
        return res.status(400).json({ success: false, message: "Code already exists" });
      }
      mode.code = code;
    }

    if (name) mode.name = name;
    if (typeof isActive === "boolean") mode.isActive = isActive;

    await mode.save();

    res.status(200).json({
      success: true,
      message: "Updated successfully",
      mode
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* DELETE (soft delete recommended) */
exports.deletePaymentMode = async (req, res) => {
  try {
    const mode = await PaymentMode.findById(req.params.id);

    if (!mode) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    // Soft delete
    mode.isActive = false;
    await mode.save();

    res.status(200).json({
      success: true,
      message: "Payment mode deactivated"
    });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* PUBLIC: GET ACTIVE MODES */
exports.getActivePaymentModes = async (req, res) => {
  try {
    const modes = await PaymentMode.find({ isActive: true }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      modes
    });
  } catch (error) {
    console.error("GET ACTIVE ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};