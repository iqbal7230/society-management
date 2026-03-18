import pool from "../config/db.js";

// POST /api/push-tokens
// Body: { token: string; deviceType?: string }
export const registerPushToken = async (req, res) => {
  try {
    const { token, deviceType } = req.body;
    const { id: userId } = req.user;

    if (!token) {
      return res.status(400).json({ error: "token is required" });
    }

    const userRes = await pool.query(
      "SELECT flat_id FROM users WHERE id = $1",
      [userId],
    );
    const flatId = userRes.rows[0]?.flat_id;

    if (!flatId) {
      return res
        .status(400)
        .json({ error: "User is not linked to a flat" });
    }

    await pool.query(
      `INSERT INTO push_tokens (flat_id, fcm_token, device_type)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [flatId, token, deviceType || "web"],
    );

    return res.status(201).json({ success: true });
  } catch (err) {
    console.error("Register push token error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

