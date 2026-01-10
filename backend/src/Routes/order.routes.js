const express = require("express");
const router = express.Router();
const auth = require("../Middlewares/auth.middleware");
const {
  createOrder,
  getOrder,
  getOrderPublic
} = require("../Controllers/order.controller");

router.post("/api/v1/orders", auth, createOrder);
router.get("/api/v1/orders/:order_id", auth, getOrder);
// Public endpoint for checkout page (no auth required)
router.get("/api/v1/orders/:order_id/public", getOrderPublic);

module.exports = router;
