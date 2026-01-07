const express = require("express");
const router = express.Router();
const auth = require("../Middlewares/auth.middleware");
const { createOrder } = require("../Controllers/order.controller");

router.post("/api/v1/orders", auth, createOrder);

module.exports = router;
