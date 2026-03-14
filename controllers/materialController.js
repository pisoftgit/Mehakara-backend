const Material = require('../models/materialModel');


/**
 * Create Material
 * Admin & Artist allowed
 */
exports.createMaterial = async (req, res) => {
  try {

    if (req.user.role !== 'admin' && req.user.role !== 'artist') {
      return res.status(403).json({
        success: false,
        message: "Only admin or artist can create material"
      });
    }

    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required"
      });
    }

    const existing = await Material.findOne({ name });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Material already exists"
      });
    }

    const material = await Material.create({
      name,
      description
    });

    res.status(201).json({
      success: true,
      message: "Material created successfully",
      material
    });

  } catch (error) {
    console.error("CREATE MATERIAL ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



/**
 * Get All Materials
 */
exports.getMaterials = async (req, res) => {
  try {

    const materials = await Material.find({ isActive: true });

    res.status(200).json({
      success: true,
      count: materials.length,
      materials
    });

  } catch (error) {
    console.error("GET MATERIALS ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



/**
 * Get Material by ID
 */
exports.getMaterialById = async (req, res) => {
  try {

    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found"
      });
    }

    res.status(200).json({
      success: true,
      material
    });

  } catch (error) {
    console.error("GET MATERIAL ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



/**
 * Update Material
 */
exports.updateMaterial = async (req, res) => {
  try {

    if (req.user.role !== 'admin' && req.user.role !== 'artist') {
      return res.status(403).json({
        success: false,
        message: "Only admin or artist can update material"
      });
    }

    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found"
      });
    }

    const { name, description, isActive } = req.body;

    if (name !== undefined) material.name = name;
    if (description !== undefined) material.description = description;
    if (isActive !== undefined) material.isActive = isActive;

    await material.save();

    res.status(200).json({
      success: true,
      message: "Material updated successfully",
      material
    });

  } catch (error) {
    console.error("UPDATE MATERIAL ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



/**
 * Delete Material
 */
exports.deleteMaterial = async (req, res) => {
  try {

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only admin can delete material"
      });
    }

    const material = await Material.findByIdAndDelete(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Material deleted successfully"
    });

  } catch (error) {
    console.error("DELETE MATERIAL ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};