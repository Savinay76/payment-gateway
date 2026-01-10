const { createRefund } = require("../services/refundService");

async function refundPayment(req, res) {
  const { paymentId, amount } = req.body;
  const refund = await createRefund(paymentId, amount);
  res.json(refund);
}

module.exports = { refundPayment };
