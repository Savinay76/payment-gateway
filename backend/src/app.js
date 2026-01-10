const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json()); 

const healthRoutes = require("./Routes/health.routes");
const orderRoutes = require("./Routes/order.routes");
const paymentRoutes = require("./Routes/payment.routes");
const refundRoutes = require("./Routes/refund.js");
const webhookRoutes = require("./Routes/webhook.js");
const authRoutes = require("./Routes/auth.routes");

app.use("/", paymentRoutes);
app.use("/", healthRoutes);
app.use("/", orderRoutes);
app.use("/", authRoutes);
app.use("/api/v1/refunds", refundRoutes);
app.use("/api/v1/webhook", webhookRoutes);

module.exports = app;
