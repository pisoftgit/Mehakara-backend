const express = require('express');
const router = express.Router();
const { getAdmins, updateAdminPermissions, toggleAdminStatus } = require('../controllers/adminController');

router.get('/', getAdmins);
router.put('/permissions', updateAdminPermissions);
router.patch('/toggle-status/:id', toggleAdminStatus);

module.exports = router;
