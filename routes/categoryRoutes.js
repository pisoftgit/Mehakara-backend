const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');

const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getCategoriesWithSubCategories
} = require('../controllers/categoryController');


/* CREATE CATEGORY (TOKEN REQUIRED) */
router.post('/', protect, createCategory);


router.get('/tree', getCategoriesWithSubCategories);


/* GET ALL CATEGORIES (PUBLIC) */
router.get('/', getCategories);


/* GET SINGLE CATEGORY (PUBLIC) */
router.get('/:id', getCategory);


/* UPDATE CATEGORY (TOKEN REQUIRED) */
router.patch('/:id', protect, updateCategory);


/* DELETE CATEGORY (TOKEN REQUIRED) */
router.delete('/:id', protect, deleteCategory);


module.exports = router;