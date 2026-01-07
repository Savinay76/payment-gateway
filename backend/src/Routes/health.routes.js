const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    return res.status(200).json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(200).json({
      status: "healthy",
      database: "disconnected",
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
