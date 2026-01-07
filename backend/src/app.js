const express = require("express");
const app = express();

app.use(express.json());

const healthRoutes = require("./Routes/health.routes");
app.use("/", healthRoutes);

module.exports = app;
