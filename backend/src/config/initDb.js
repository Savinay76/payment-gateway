const fs = require("fs");
const path = require("path");
const db = require("./db");

async function initDb() {
  try {
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Split by semicolon and execute each statement separately
    // This handles cases where statements might fail if objects already exist
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      try {
        await db.query(statement);
      } catch (err) {
        // Ignore errors for "already exists" cases (IF NOT EXISTS should prevent this, but just in case)
        if (!err.message.includes('already exists')) {
          console.warn(`Warning executing statement: ${err.message}`);
        }
      }
    }

    console.log("✅ Database schema initialized");
  } catch (error) {
    console.error("❌ Database initialization error:", error.message);
    throw error;
  }
}

module.exports = initDb;
