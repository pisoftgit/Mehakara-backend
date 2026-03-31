// routes/paymentModeRoutes.js

const express = require("express");
const router = express.Router();

const {
  createPaymentMode,
  getAllPaymentModes,
  getPaymentModeById,
  updatePaymentMode,
  deletePaymentMode,
  getActivePaymentModes
} = require("../controllers/paymentModeController");

const { protect, restrictTo } = require("../middlewares/authMiddleware");

/* PUBLIC */
router.get("/active", getActivePaymentModes);

/* ADMIN ONLY */
router.post("/", protect, restrictTo("admin","superadmin"), createPaymentMode);
router.get("/", protect, restrictTo("admin","superadmin"), getAllPaymentModes);
router.get("/:id", protect, restrictTo("admin","superadmin"), getPaymentModeById);
router.put("/:id", protect, restrictTo("admin","superadmin"), updatePaymentMode);
router.delete("/:id", protect, restrictTo("admin","superadmin"), deletePaymentMode);

module.exports = router;