const Permission = require('../models/permissionModel');

// Create a new permission (Module)
exports.createPermission = async (req, res) => {
  try {
    const { title, url } = req.body;
    const permission = new Permission({ title, url });
    await permission.save();
    res.status(201).json({ success: true, data: permission });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all permissions
exports.getPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find();
    res.status(200).json({ success: true, data: permissions });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update a permission
exports.updatePermission = async (req, res) => {
  try {
    const permission = await Permission.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!permission) {
      return res.status(404).json({ success: false, message: 'Permission not found' });
    }
    res.status(200).json({ success: true, data: permission });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a permission
exports.deletePermission = async (req, res) => {
  try {
    const permission = await Permission.findByIdAndDelete(req.params.id);
    if (!permission) {
      return res.status(404).json({ success: false, message: 'Permission not found' });
    }
    res.status(200).json({ success: true, message: 'Permission deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
