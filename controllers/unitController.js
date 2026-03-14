const Unit = require('../models/unitModel');


/**
 * Create Unit (Admin)
 */
exports.createUnit = async (req, res) => {
  try {

    if (req.user.role !== 'admin' && req.user.role !=="artist") {
      return res.status(403).json({
        success: false,
        message: "Only admin or artist can create units"
      });
    }

    const { name, symbol, description } = req.body;

    if (!name || !symbol) {
      return res.status(400).json({
        success: false,
        message: "Name and symbol are required"
      });
    }

    const existing = await Unit.findOne({ name });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Unit already exists"
      });
    }

    const unit = await Unit.create({
      name,
      symbol,
      description
    });

    res.status(201).json({
      success: true,
      message: "Unit created successfully",
      unit
    });

  } catch (error) {
    console.error("CREATE UNIT ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



/**
 * Get All Units
 */
exports.getUnits = async (req, res) => {
  try {

    const units = await Unit.find({ isActive: true });

    res.status(200).json({
      success: true,
      count: units.length,
      units
    });

  } catch (error) {
    console.error("GET UNITS ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



/**
 * Get Single Unit
 */
exports.getUnitById = async (req, res) => {
  try {

    const unit = await Unit.findById(req.params.id);

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found"
      });
    }

    res.status(200).json({
      success: true,
      unit
    });

  } catch (error) {
    console.error("GET UNIT ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



/**
 * Update Unit (Admin)
 */
exports.updateUnit = async (req, res) => {
  try {

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only admin can update units"
      });
    }

    const unit = await Unit.findById(req.params.id);

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found"
      });
    }

    const { name, symbol, description, isActive } = req.body;

    if (name !== undefined) unit.name = name;
    if (symbol !== undefined) unit.symbol = symbol;
    if (description !== undefined) unit.description = description;
    if (isActive !== undefined) unit.isActive = isActive;

    await unit.save();

    res.status(200).json({
      success: true,
      message: "Unit updated successfully",
      unit
    });

  } catch (error) {
    console.error("UPDATE UNIT ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



/**
 * Delete Unit (Admin)
 */
exports.deleteUnit = async (req, res) => {
  try {

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only admin can delete units"
      });
    }

    const unit = await Unit.findByIdAndDelete(req.params.id);

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Unit deleted successfully"
    });

  } catch (error) {
    console.error("DELETE UNIT ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};   