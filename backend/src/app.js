const express = require("express");
const app = express();

app.use(express.json());

const healthRoutes = require("./Routes/health.routes");
const orderRoutes = require("./Routes/order.routes");

app.use("/", healthRoutes);
app.use("/", orderRoutes);

module.exports = app;
