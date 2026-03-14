const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');

const {
  createMaterial,
  getMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial
} = require('../controllers/materialController');


router.post('/', protect, createMaterial);

router.get('/', getMaterials);

router.get('/:id', getMaterialById);

router.put('/:id', protect, updateMaterial);

router.delete('/:id', protect, deleteMaterial);

module.exports = router;