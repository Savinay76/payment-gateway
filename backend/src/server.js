require("dotenv").config();
const app = require("./app");
const db = require("./config/db");
require("./seed/seedMerchant");

const PORT = process.env.PORT || 8000;

app.listen(PORT, async () => {
  await db.query("SELECT 1");
  console.log(`🚀 API running on port ${PORT}`);
});
