const db = require("../config/db");
const { generateId } = require("../utils/idGenerator");

async function createRefund(paymentId, amount) {
  const refundId = generateId("ref_");

  await db.query(
    "INSERT INTO refunds(id,payment_id,amount,status) VALUES($1,$2,$3,$4)",
    [refundId, paymentId, amount, "processed"]
  );

  return { refundId, status: "processed" };
}

module.exports = { createRefund };
