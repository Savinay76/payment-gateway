const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json()); 

const healthRoutes = require("./Routes/health.routes");
const orderRoutes = require("./Routes/order.routes");
const paymentRoutes = require("./Routes/payment.routes");

app.use("/", paymentRoutes);
app.use("/", healthRoutes);
app.use("/", orderRoutes);

module.exports = app;
