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
router.post("/", protect, restrictTo("admin"), createPaymentMode);
router.get("/", protect, restrictTo("admin"), getAllPaymentModes);
router.get("/:id", protect, restrictTo("admin"), getPaymentModeById);
router.put("/:id", protect, restrictTo("admin"), updatePaymentMode);
router.delete("/:id", protect, restrictTo("admin"), deletePaymentMode);

module.exports = router;