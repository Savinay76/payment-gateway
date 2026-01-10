const crypto = require("crypto");

async function simulateGateway(paymentId) {
  const payload = { payment_id: paymentId, status: "success" };

  const signature = crypto
    .createHmac("sha256", process.env.WEBHOOK_SECRET || "secret")
    .update(JSON.stringify(payload))
    .digest("hex");

  const webhookUrl = process.env.WEBHOOK_URL || "http://localhost:8000/api/v1/webhook/payment";
  await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-gateway-signature": signature,
    },
    body: JSON.stringify(payload),
  });
}

module.exports = { simulateGateway };
