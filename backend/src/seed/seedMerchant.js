const db = require("../config/db");

(async () => {
  const check = await db.query(
    "SELECT 1 FROM merchants WHERE email=$1",
    ["test@example.com"]
  );

  if (check.rowCount === 0) {
    await db.query(`
      INSERT INTO merchants (
        id, name, email, api_key, api_secret, is_active
      ) VALUES (
        '550e8400-e29b-41d4-a716-446655440000',
        'Test Merchant',
        'test@example.com',
        'key_test_abc123',
        'secret_test_xyz789',
        true
      )
    `);
    console.log("✅ Test merchant seeded");
  }
})();
