const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');

const {
  createSubCategory,
  getSubCategories,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory
} = require('../controllers/subCategoryController');


/* CREATE SUBCATEGORY (TOKEN REQUIRED) */
router.post('/', protect, createSubCategory);


/* GET ALL SUBCATEGORIES (PUBLIC) */
router.get('/', getSubCategories);


/* GET SINGLE SUBCATEGORY (PUBLIC) */
router.get('/:id', getSubCategory);


/* UPDATE SUBCATEGORY (TOKEN REQUIRED) */
router.patch('/:id', protect, updateSubCategory);


/* DELETE SUBCATEGORY (TOKEN REQUIRED) */
router.delete('/:id', protect, deleteSubCategory);


module.exports = router;