require("dotenv").config();
const app = require("./app");
const db = require("./config/db");
const initDb = require("./config/initDb");
const seedMerchant = require("./seed/seedMerchant");

const PORT = process.env.PORT || 8000;

async function startServer() {
  try {
    // wait for postgres
    await db.query("SELECT 1");

    // create tables
    await initDb();

    // seed test merchant
    await seedMerchant();

    app.listen(PORT, () => {
      console.log(`🚀 API running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup failed:", err.message);
    process.exit(1);
  }
}

startServer();
