const express = require("express");
const router = express.Router();
const auth = require("../Middlewares/auth.middleware");
const {
  createOrder,
  getOrder
} = require("../Controllers/order.controller");

router.post("/api/v1/orders", auth, createOrder);
router.get("/api/v1/orders/:order_id", auth, getOrder);

module.exports = router;
