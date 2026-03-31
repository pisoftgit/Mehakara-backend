const User = require('../models/userModel');

// Get all admin and superadmin users
exports.getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } }).populate('permissions');
    res.status(200).json({ success: true, data: admins });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update and Admin's Permissions
exports.updateAdminPermissions = async (req, res) => {
  try {
    const { userId, permissions } = req.body;
    const admin = await User.findById(userId);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    admin.permissions = permissions;
    await admin.save();
    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Toggle Admin Active Status
exports.toggleAdminStatus = async (req, res) => {
    try {
        const admin = await User.findById(req.params.id);
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }
        admin.isActive = !admin.isActive;
        await admin.save();
        res.status(200).json({ success: true, data: admin });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
