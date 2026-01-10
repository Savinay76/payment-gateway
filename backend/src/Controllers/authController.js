const db = require("../config/db");

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          description: "Email and password are required"
        }
      });
    }

    // For now, password is the api_secret
    const result = await db.query(
      `SELECT id, name, email, api_key, api_secret, is_active 
       FROM merchants 
       WHERE email=$1 AND api_secret=$2`,
      [email, password]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        error: {
          code: "AUTHENTICATION_ERROR",
          description: "Invalid email or password"
        }
      });
    }

    const merchant = result.rows[0];

    if (!merchant.is_active) {
      return res.status(401).json({
        error: {
          code: "AUTHENTICATION_ERROR",
          description: "Merchant account is inactive"
        }
      });
    }

    // Return token (using api_key as token for simplicity)
    res.status(200).json({
      token: merchant.api_key,
      merchant: {
        id: merchant.id,
        name: merchant.name,
        email: merchant.email
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        description: "An error occurred during login"
      }
    });
  }
}

async function getCurrentMerchant(req, res) {
  try {
    const merchant = req.merchant;
    
    const result = await db.query(
      `SELECT id, name, email, is_active, created_at 
       FROM merchants 
       WHERE id=$1`,
      [merchant.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          description: "Merchant not found"
        }
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Get merchant error:", error);
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        description: "An error occurred"
      }
    });
  }
}

module.exports = { login, getCurrentMerchant };

