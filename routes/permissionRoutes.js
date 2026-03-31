const express = require('express');
const router = express.Router();
const { createPermission, getPermissions, updatePermission, deletePermission } = require('../controllers/permissionController');

router.post('/', createPermission);
router.get('/', getPermissions);
router.put('/:id', updatePermission);
router.delete('/:id', deletePermission);

module.exports = router;
