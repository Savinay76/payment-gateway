const crypto = require("crypto");

function verifyWebhook(req, res, next) {
  const signature = req.headers["x-gateway-signature"];
  const payload = JSON.stringify(req.body);
  const webhookSecret = process.env.WEBHOOK_SECRET || "secret";

  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(payload)
    .digest("hex");

  if (signature !== expected) {
    return res.status(401).json({ error: "Invalid webhook signature" });
  }

  next();
}

module.exports = { verifyWebhook };
