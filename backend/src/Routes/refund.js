const express = require("express");
const { refundPayment } = require("../Controllers/refundController");

const router = express.Router();
router.post("/", refundPayment);

module.exports = router;
