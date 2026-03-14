const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');

const {
  createUnit,
  getUnits,
  getUnitById,
  updateUnit,
  deleteUnit
} = require('../controllers/unitController');


router.post('/', protect, createUnit);

router.get('/', getUnits);

router.get('/:id', getUnitById);

router.put('/:id', protect, updateUnit);

router.delete('/:id', protect, deleteUnit);


module.exports = router;