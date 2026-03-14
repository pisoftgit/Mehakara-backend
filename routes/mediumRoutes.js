const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');

const {
  createMedium,
  getMediums,
  getMediumById,
  updateMedium,
  deleteMedium
} = require('../controllers/mediumController');


router.post('/', protect, createMedium);

router.get('/', getMediums);

router.get('/:id', getMediumById);

router.put('/:id', protect, updateMedium);

router.delete('/:id', protect, deleteMedium);

module.exports = router;