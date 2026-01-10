const express = require("express");
const { handleWebhook } = require("../Controllers/webhookController");
const { verifyWebhook } = require("../Middlewares/verifyWebhook");

const router = express.Router();
router.post("/payment", verifyWebhook, handleWebhook);

module.exports = router;
