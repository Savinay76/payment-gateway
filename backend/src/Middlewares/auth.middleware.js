const db = require("../config/db");

module.exports = async function authMiddleware(req, res, next) {
  // Support both Bearer token and API key/secret authentication
  const authHeader = req.header("Authorization");
  const apiKey = req.header("X-Api-Key");
  const apiSecret = req.header("X-Api-Secret");

  let query;
  let params;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    // Bearer token authentication (for dashboard/frontend)
    const token = authHeader.substring(7);
    query = `SELECT id, is_active FROM merchants WHERE api_key=$1`;
    params = [token];
  } else if (apiKey && apiSecret) {
    // API key/secret authentication (for external API calls)
    query = `SELECT id, is_active FROM merchants WHERE api_key=$1 AND api_secret=$2`;
    params = [apiKey, apiSecret];
  } else {
    return res.status(401).json({
      error: {
        code: "AUTHENTICATION_ERROR",
        description: "Invalid API credentials. Provide Authorization: Bearer <token> or X-Api-Key and X-Api-Secret headers"
      }
    });
  }

  const result = await db.query(query, params);

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
