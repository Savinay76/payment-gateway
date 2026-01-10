const express = require("express");
const router = express.Router();
const { login, getCurrentMerchant } = require("../Controllers/authController");
const auth = require("../Middlewares/auth.middleware");

router.post("/api/v1/auth/login", login);
router.get("/api/v1/merchant/me", auth, getCurrentMerchant);

module.exports = router;

