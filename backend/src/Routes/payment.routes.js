const express = require("express");
const router = express.Router();
const auth = require("../Middlewares/auth.middleware");
const {
  createPayment,
  getPayment
} = require("../Controllers/payment.controller");

router.post("/api/v1/payments", auth, createPayment);
router.get("/api/v1/payments/:payment_id", auth, getPayment);

module.exports = router;
