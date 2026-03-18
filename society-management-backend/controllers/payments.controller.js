import pool from "../config/db.js";

// Helper: get user's flat_id
async function getUserFlatId(userId) {
  const result = await pool.query("SELECT flat_id FROM users WHERE id = $1", [
    userId,
  ]);
  return result.rows[0]?.flat_id || null;
}

// POST /api/payments { flatId, month, amount, mode }
export const addPayment = async (req, res) => {
  try {
    const { flatId, month, amount, mode } = req.body;
    const { role, id: userId } = req.user;

    if (!flatId || !month || !amount || !mode) {
      return res
        .status(400)
        .json({ error: "flatId, month, amount and mode are required" });
    }

    if (!["Cash", "UPI", "Online"].includes(mode)) {
      return res.status(400).json({ error: "Invalid payment mode" });
    }

    // Enforce ownership for residents
    if (role === "user") {
      const userFlatId = await getUserFlatId(userId);
      if (!userFlatId || Number(userFlatId) !== Number(flatId)) {
        return res.status(403).json({ error: "Access denied for this flat" });
      }
    }

    // Find or create monthly record
    let recordRes = await pool.query(
      "SELECT * FROM monthly_records WHERE flat_id = $1 AND month = $2",
      [flatId, month],
    );

    if (recordRes.rows.length === 0) {
      // Determine default amount from plan if not provided
      let finalAmount = Number(amount);
      if (!finalAmount) {
        const flatRes = await pool.query(
          "SELECT type FROM flats WHERE id = $1",
          [flatId],
        );
        const flat = flatRes.rows[0];
        if (!flat) {
          return res.status(404).json({ error: "Flat not found" });
        }
        const planRes = await pool.query(
          "SELECT amount FROM subscription_plans WHERE type = $1",
          [flat.type],
        );
        finalAmount = Number(planRes.rows[0]?.amount || 0);
      }

      await pool.query(
        `INSERT INTO monthly_records
         (flat_id, month, amount, status, payment_mode, payment_date, paid_by)
         VALUES ($1, $2, $3, 'pending', '', NULL, '')`,
        [flatId, month, finalAmount],
      );

      recordRes = await pool.query(
        "SELECT * FROM monthly_records WHERE flat_id = $1 AND month = $2",
        [flatId, month],
      );
    }

    const record = recordRes.rows[0];

    if (record.status === "paid") {
      return res.status(400).json({
        success: false,
        error: "Already paid for this month",
      });
    }

    const updatedRes = await pool.query(
      `UPDATE monthly_records
        SET status = 'paid',
       amount = $2,
       payment_mode = $3,
       payment_date = CURRENT_DATE,
       paid_by = $4,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
        RETURNING *`,
      [record.id, amount, mode, role === "admin" ? "admin" : "resident"],
    );

    return res.json({
      success: true,
      message: "Payment recorded successfully",
      record: updatedRes.rows[0],
    });
  } catch (err) {
    console.error("Add payment error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
