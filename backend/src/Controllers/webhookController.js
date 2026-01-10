const db = require("../config/db");

async function handleWebhook(req, res) {
  try {
    const { payment_id, status } = req.body;

    if (!payment_id || !status) {
      return res.status(400).json({ error: "Missing payment_id or status" });
    }

    await db.query(
      `UPDATE payments
       SET status=$1, updated_at=CURRENT_TIMESTAMP
       WHERE id=$2`,
      [status, payment_id]
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { handleWebhook };

