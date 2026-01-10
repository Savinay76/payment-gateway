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

// Public endpoint for checkout page (no auth required, but validates order exists)
exports.createPaymentPublic = async (req, res) => {
  const { order_id, method, vpa, card } = req.body;

  // Find order and get merchant_id
  const orderRes = await db.query(
    "SELECT * FROM orders WHERE id=$1",
    [order_id]
  );

  if (orderRes.rowCount === 0) {
    return res.status(404).json({
      error: { code: "NOT_FOUND_ERROR", description: "Order not found" }
    });
  }

  const order = orderRes.rows[0];

  // Validate order status
  if (order.status !== "created") {
    return res.status(400).json({
      error: { code: "BAD_REQUEST_ERROR", description: "Order is not in created status" }
    });
  }

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
      order.merchant_id,
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

  const response = {
    id: paymentId,
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    method,
    status: success ? "success" : "failed",
    created_at: new Date().toISOString()
  };

  if (method === "upi") {
    response.vpa = paymentData.vpa;
  }

  if (method === "card") {
    response.card_network = paymentData.card_network;
    response.card_last4 = paymentData.card_last4;
  }

  return res.status(201).json(response);
};

// Public endpoint to get payment status (no auth required)
exports.getPaymentPublic = async (req, res) => {
  const { payment_id } = req.params;

  const result = await db.query(
    `SELECT id, order_id, amount, currency, method, status, 
            vpa, card_network, card_last4, error_code, error_description,
            created_at, updated_at
     FROM payments
     WHERE id = $1`,
    [payment_id]
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

  // Include error info if failed
  if (p.status === "failed") {
    response.error_code = p.error_code;
    response.error_description = p.error_description;
  }

  return res.status(200).json(response);
};

exports.getAllPayments = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, order_id, amount, currency, method, status, 
              card_network, card_last4, vpa, created_at, updated_at
       FROM payments
       WHERE merchant_id = $1
       ORDER BY created_at DESC`,
      [req.merchant.id]
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get payments error:", error);
    return res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        description: "An error occurred while fetching payments"
      }
    });
  }
};

exports.createPaymentSimple = async (req, res) => {
  // Simplified payment creation that creates order and payment in one call
  // For frontend/dashboard use
  const { amount, currency = "INR", method = "upi", vpa, card } = req.body;

  if (!amount || !Number.isInteger(amount) || amount < 100) {
    return res.status(400).json({
      error: { code: "VALIDATION_ERROR", description: "amount must be at least 100" }
    });
  }

  try {
    // Create order first
    const orderId = generateId("order_");
    await db.query(
      `INSERT INTO orders (id, merchant_id, amount, currency, status)
       VALUES ($1, $2, $3, $4, 'created')`,
      [orderId, req.merchant.id, amount, currency]
    );

    // Create payment
    const paymentId = generateId("pay_");
    let paymentData = { vpa: null, card_network: null, card_last4: null };

    if (method === "upi" && vpa) {
      if (!isValidVPA(vpa)) {
        return res.status(400).json({
          error: { code: "INVALID_VPA", description: "VPA format invalid" }
        });
      }
      paymentData.vpa = vpa;
    } else if (method === "card" && card) {
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

    await db.query(
      `INSERT INTO payments
       (id, order_id, merchant_id, amount, currency, method, status, vpa, card_network, card_last4)
       VALUES ($1, $2, $3, $4, $5, $6, 'processing', $7, $8, $9)`,
      [
        paymentId,
        orderId,
        req.merchant.id,
        amount,
        currency,
        method,
        paymentData.vpa,
        paymentData.card_network,
        paymentData.card_last4
      ]
    );

    // Process payment
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
       SET status=$1, error_code=$2, error_description=$3, updated_at=CURRENT_TIMESTAMP
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
      order_id: orderId,
      amount,
      currency,
      method,
      status: success ? "success" : "failed",
      ...paymentData,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error("Create payment error:", error);
    return res.status(500).json({
      error: { code: "INTERNAL_ERROR", description: "An error occurred while creating payment" }
    });
  }
};
