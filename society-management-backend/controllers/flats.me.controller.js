import pool from "../config/db.js";

// GET /api/flats/me (resident)
export const getMyFlat = async (req, res) => {
  try {
    const userRes = await pool.query(
      "SELECT flat_id, name FROM users WHERE id = $1",
      [req.user.id],
    );
    const flatId = userRes.rows[0]?.flat_id;
    if (!flatId) {
      return res.status(404).json({ error: "No flat assigned to this user" });
    }

    const flatRes = await pool.query(
      "SELECT id, flat_no, type, is_active FROM flats WHERE id = $1",
      [flatId],
    );
    if (flatRes.rows.length === 0) {
      return res.status(404).json({ error: "Flat not found" });
    }

    res.json({
      id: flatRes.rows[0].id,
      flat_no: flatRes.rows[0].flat_no,
      type: flatRes.rows[0].type,
      is_active: flatRes.rows[0].is_active,
      owner_name: userRes.rows[0]?.name || "",
    });
  } catch (err) {
    console.error("Get my flat error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

