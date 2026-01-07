const fs = require("fs");
const path = require("path");
const db = require("./db");

async function initDb() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");

  await db.query(schema);
  console.log("✅ Database schema initialized");
}

module.exports = initDb;
