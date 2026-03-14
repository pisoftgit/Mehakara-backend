const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');

const {
  createStyle,
  getStyles,
  getStyleById,
  updateStyle,
  deleteStyle
} = require('../controllers/styleController');


router.post('/', protect, createStyle);

router.get('/', getStyles);

router.get('/:id', getStyleById);

router.put('/:id', protect, updateStyle);

router.delete('/:id', protect, deleteStyle);

module.exports = router;