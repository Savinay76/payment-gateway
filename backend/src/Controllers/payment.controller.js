const db = require("../config/db");
const { generateId } = require("../utils/idGenerator");
const {
  isValidVPA,
  isValidCardNumber,
  detectNetwork,
  isValidExpiry
} = require("../utils/paymentValidation");

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

exports.createPayment = async (req, res) => {
  const { order_id, method, vpa, card } = req.body;

  const orderRes = await db.query(
    "SELECT * FROM orders WHERE id=$1 AND merchant_id=$2",
    [order_id, req.merchant.id]
  );

  if (orderRes.rowCount === 0) {
    return res.status(404).json({
      error: { code: "NOT_FOUND_ERROR", description: "Order not found" }
    });
  }

  const order = orderRes.rows[0];

  // -------- VALIDATION --------
  let paymentData = {};

  if (method === "upi") {
    if (!isValidVPA(vpa)) {
      return res.status(400).json({
        error: { code: "INVALID_VPA", description: "VPA format invalid" }
      });
    }
    paymentData.vpa = vpa;
  }

  if (method === "card") {
    const { number, expiry_month, expiry_year } = card;

    if (!isValidCardNumber(number)) {
      return res.status(400).json({
        error: { code: "INVALID_CARD", description: "Card validation failed" }
      });
    }

    if (!isValidExpiry(expiry_month, expiry_year)) {
      return res.status(400).json({
        error: { code: "EXPIRED_CARD", description: "Card expiry invalid" }
      });
    }

    paymentData.card_network = detectNetwork(number);
    paymentData.card_last4 = number.slice(-4);
  }

  // -------- CREATE PAYMENT --------
  const paymentId = generateId("pay_");

  await db.query(
    `INSERT INTO payments
     (id, order_id, merchant_id, amount, currency, method, status, vpa, card_network, card_last4)
     VALUES ($1,$2,$3,$4,$5,$6,'processing',$7,$8,$9)`,
    [
      paymentId,
      order.id,
      req.merchant.id,
      order.amount,
      order.currency,
      method,
      paymentData.vpa || null,
      paymentData.card_network || null,
      paymentData.card_last4 || null
    ]
  );

  // -------- PROCESSING --------
  const testMode = process.env.TEST_MODE === "true";
  const delay = testMode
    ? Number(process.env.TEST_PROCESSING_DELAY || 1000)
    : 5000 + Math.random() * 5000;

  await sleep(delay);

  let success = testMode
    ? process.env.TEST_PAYMENT_SUCCESS !== "false"
    : method === "upi"
      ? Math.random() < 0.9
      : Math.random() < 0.95;

  await db.query(
    `UPDATE payments
     SET status=$1,
         error_code=$2,
         error_description=$3,
         updated_at=CURRENT_TIMESTAMP
     WHERE id=$4`,
    [
      success ? "success" : "failed",
      success ? null : "PAYMENT_FAILED",
      success ? null : "Payment could not be processed",
      paymentId
    ]
  );

  return res.status(201).json({
    id: paymentId,
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    method,
    status: success ? "success" : "failed",
    ...paymentData,
    created_at: new Date().toISOString()
  });
};
exports.getPayment = async (req, res) => {
  const { payment_id } = req.params;

  const result = await db.query(
    `SELECT *
     FROM payments
     WHERE id = $1 AND merchant_id = $2`,
    [payment_id, req.merchant.id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({
      error: {
        code: "NOT_FOUND_ERROR",
        description: "Payment not found"
      }
    });
  }

  const p = result.rows[0];

  const response = {
    id: p.id,
    order_id: p.order_id,
    amount: p.amount,
    currency: p.currency,
    method: p.method,
    status: p.status,
    created_at: p.created_at,
    updated_at: p.updated_at
  };

  // method-specific fields
  if (p.method === "upi") {
    response.vpa = p.vpa;
  }

  if (p.method === "card") {
    response.card_network = p.card_network;
    response.card_last4 = p.card_last4;
  }

  return res.status(200).json(response);
};
