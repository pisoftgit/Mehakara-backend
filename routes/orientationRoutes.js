const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');

const {
  createOrientation,
  getOrientations,
  getOrientationById,
  updateOrientation,
  deleteOrientation
} = require('../controllers/orientationController');


router.post('/', protect, createOrientation);

router.get('/', getOrientations);

router.get('/:id', getOrientationById);

router.put('/:id', protect, updateOrientation);

router.delete('/:id', protect, deleteOrientation);

module.exports = router;