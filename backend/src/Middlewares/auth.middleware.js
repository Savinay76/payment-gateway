const db = require("../config/db");

module.exports = async function authMiddleware(req, res, next) {
  const apiKey = req.header("X-Api-Key");
  const apiSecret = req.header("X-Api-Secret");

  if (!apiKey || !apiSecret) {
    return res.status(401).json({
      error: {
        code: "AUTHENTICATION_ERROR",
        description: "Invalid API credentials"
      }
    });
  }

  const result = await db.query(
    `SELECT id, is_active FROM merchants
     WHERE api_key=$1 AND api_secret=$2`,
    [apiKey, apiSecret]
  );

  if (result.rowCount === 0 || !result.rows[0].is_active) {
    return res.status(401).json({
      error: {
        code: "AUTHENTICATION_ERROR",
        description: "Invalid API credentials"
      }
    });
  }

  req.merchant = {
    id: result.rows[0].id
  };

  next();
};
