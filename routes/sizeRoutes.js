const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');

const {
  createSize,
  getSizes,
  getSizeById,
  updateSize,
  deleteSize
} = require('../controllers/sizeController');


router.post('/', protect, createSize);

router.get('/', getSizes);

router.get('/:id', getSizeById);

router.put('/:id', protect, updateSize);

router.delete('/:id', protect, deleteSize);


module.exports = router;