const express = require('express');
const router = express.Router();
const currencyController = require('../controllers/currencyController');
const { protect } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', currencyController.getCurrencies);
router.get('/:code', currencyController.getCurrencyByCode);

// Admin only routes
router.post('/', protect, currencyController.createCurrency);
router.put('/:code', protect, currencyController.updateCurrency);
router.delete('/:code', protect, currencyController.deleteCurrency);
router.put('/exchange-rates/update', protect, currencyController.updateExchangeRates);

module.exports = router;