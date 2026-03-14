const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');

const {
  createTheme,
  getThemes,
  getThemeById,
  updateTheme,
  deleteTheme
} = require('../controllers/themeController');


router.post('/', protect, createTheme);

router.get('/', getThemes);

router.get('/:id', getThemeById);

router.put('/:id', protect, updateTheme);

router.delete('/:id', protect, deleteTheme);

module.exports = router;