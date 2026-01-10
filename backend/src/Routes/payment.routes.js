const express = require("express");
const router = express.Router();
const auth = require("../Middlewares/auth.middleware");
const {
  createPayment,
  getPayment,
  getAllPayments,
  createPaymentSimple,
  createPaymentPublic,
  getPaymentPublic
} = require("../Controllers/payment.controller");

router.post("/api/v1/payments", auth, createPayment);
router.get("/api/v1/payments", auth, getAllPayments);
router.get("/api/v1/payments/:payment_id", auth, getPayment);
// Simplified endpoint for frontend dashboard
router.post("/api/v1/payments/simple", auth, createPaymentSimple);
// Public endpoints for checkout page (no auth required)
router.post("/api/v1/payments/public", createPaymentPublic);
router.get("/api/v1/payments/:payment_id/public", getPaymentPublic);

module.exports = router;
