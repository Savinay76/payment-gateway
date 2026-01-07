const db = require("../config/db");
const { generateId } = require("../utils/idGenerator");

exports.createOrder = async (req, res) => {
  const { amount, currency = "INR", receipt, notes } = req.body;

  if (!amount || !Number.isInteger(amount) || amount < 100) {
    return res.status(400).json({
      error: {
        code: "BAD_REQUEST_ERROR",
        description: "amount must be at least 100"
      }
    });
  }

  let orderId;
  let exists = true;

  while (exists) {
    orderId = generateId("order_");
    const check = await db.query(
      "SELECT 1 FROM orders WHERE id=$1",
      [orderId]
    );
    exists = check.rowCount > 0;
  }

  const result = await db.query(
    `INSERT INTO orders
     (id, merchant_id, amount, currency, receipt, notes, status)
     VALUES ($1,$2,$3,$4,$5,$6,'created')
     RETURNING *`,
    [
      orderId,
      req.merchant.id,
      amount,
      currency,
      receipt || null,
      notes || null
    ]
  );

  const order = result.rows[0];

  return res.status(201).json({
    id: order.id,
    merchant_id: order.merchant_id,
    amount: order.amount,
    currency: order.currency,
    receipt: order.receipt,
    notes: order.notes || {},
    status: order.status,
    created_at: order.created_at
  });
};
exports.getOrder = async (req, res) => {
  const { order_id } = req.params;

  const result = await db.query(
    `SELECT * FROM orders WHERE id=$1 AND merchant_id=$2`,
    [order_id, req.merchant.id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({
      error: {
        code: "NOT_FOUND_ERROR",
        description: "Order not found"
      }
    });
  }

  const order = result.rows[0];

  return res.status(200).json({
    id: order.id,
    merchant_id: order.merchant_id,
    amount: order.amount,
    currency: order.currency,
    receipt: order.receipt,
    notes: order.notes || {},
    status: order.status,
    created_at: order.created_at,
    updated_at: order.updated_at
  });
};

