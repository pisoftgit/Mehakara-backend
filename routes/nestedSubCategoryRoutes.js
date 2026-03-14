const express = require('express');
const router = express.Router();

const {
  createNestedSubCategory,
  getNestedSubCategories,
  updateNestedSubCategory,
  deleteNestedSubCategory
} = require('../controllers/nestedSubCategoryController');

const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, createNestedSubCategory);

router.get('/', getNestedSubCategories);

router.patch('/:id', protect, updateNestedSubCategory);

router.delete('/:id', protect, deleteNestedSubCategory);

module.exports = router;