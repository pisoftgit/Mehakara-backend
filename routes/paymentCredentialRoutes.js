const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const {
  getCredentialTemplates,
  createPaymentCredential,
  getCredentialsByPaymentMode,
  getActiveCredential,
  updatePaymentCredential,
  activateCredential,
  deletePaymentCredential,
  getAllCredentials,
  recordCredentialUsage
} = require('../controllers/paymentCredentialController');

// ===== PUBLIC ROUTES =====
// Get credential templates
router.get('/templates', getCredentialTemplates);

// ===== ADMIN ONLY ROUTES =====

// Get all credentials (admin dashboard)
router.get(
  '/',
  protect,
  restrictTo('admin', 'superadmin'),
  getAllCredentials
);

// Create new payment credential
router.post(
  '/',
  protect,
  restrictTo('admin', 'superadmin'),
  createPaymentCredential
);

// Get all credentials for a specific payment mode
router.get(
  '/payment-mode/:paymentModeId',
  protect,
  restrictTo('admin', 'superadmin'),
  getCredentialsByPaymentMode
);

// Get active credential for a payment mode
router.get(
  '/payment-mode/:paymentModeId/active',
  protect,
  restrictTo('admin', 'superadmin'),
  getActiveCredential
);

// Update credential
router.put(
  '/:credentialId',
  protect,
  restrictTo('admin', 'superadmin'),
  updatePaymentCredential
);

// Activate credential (switch to this credential)
router.patch(
  '/:credentialId/activate',
  protect,
  restrictTo('admin', 'superadmin'),
  activateCredential
);

// Delete credential
router.delete(
  '/:credentialId',
  protect,
  restrictTo('admin', 'superadmin'),
  deletePaymentCredential
);

// Record credential usage (called when payment is processed)
router.patch(
  '/:credentialId/record-usage',
  protect,
  recordCredentialUsage
);

module.exports = router;
