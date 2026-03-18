import pool from "../config/db.js";

// Helper to get current user's flat_id (for residents)
async function getUserFlatId(userId) {
  const result = await pool.query(
    "SELECT flat_id FROM users WHERE id = $1",[userId],
  );
  return result.rows[0]?.flat_id || null;
}

// Helper to ensure records exist for a given month
async function ensureRecordsForMonth(month) {
  // Get all active flats and their types
  const flatsRes = await pool.query(
    "SELECT id, type FROM flats WHERE is_active = true",
  );
  const flats = flatsRes.rows;

  // Get plan amounts
  const plansRes = await pool.query(
    "SELECT type, amount FROM subscription_plans",
  );
  const planMap = {};
  for (const row of plansRes.rows) {
    planMap[row.type] = Number(row.amount);
  }

  for (const flat of flats) {
    const existing = await pool.query(
      "SELECT id FROM monthly_records WHERE flat_id = $1 AND month = $2",
      [flat.id, month],
    );
    if (existing.rows.length > 0) continue;

    const amount = planMap[flat.type];
    if (!amount) continue;

    await pool.query(
      `INSERT INTO monthly_records
       (flat_id, month, amount, status, payment_mode, paid_by)
       VALUES ($1, $2, $3, 'pending', '', '')`,
      [flat.id, month, amount],
    );
  }
}

// GET /api/records?month=&flatId=
export const getRecords = async (req, res) => {
  try {
    const { month, flatId } = req.query;
    const { role, id: userId } = req.user;

    // Get current month if not specified
    const currentMonth = month || new Date().toISOString().slice(0, 7); // YYYY-MM

    // Ensure records exist for the requested month (automatically create if missing)
    await ensureRecordsForMonth(currentMonth);

    const values = [];
    const where = [];

    if (month) {
      values.push(month);
      where.push(`month = $${values.length}`);
    } else {
      // If no month specified, default to current month
      values.push(currentMonth);
      where.push(`month = $${values.length}`);
    }

    if (role === "admin") {
      if (flatId) {
        values.push(flatId);
        where.push(`flat_id = $${values.length}`);
      }
    } else {
      const flat_id = await getUserFlatId(userId);
      if (!flat_id) {
        return res
          .status(400)
          .json({ error: "No flat assigned to current user" });
      }
      values.push(flat_id);
      where.push(`flat_id = $${values.length}`);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const query = `SELECT * FROM monthly_records ${whereClause} ORDER BY month DESC, flat_id`;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("Get records error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// POST /api/records/ensure { month }
export const ensureRecords = async (req, res) => {
  try {
    const { month } = req.body;
    if (!month) {
      return res.status(400).json({ error: "month is required (YYYY-MM)" });
    }

    await ensureRecordsForMonth(month);

    res.json({
      message: "Monthly records ensured for all active flats",
      created: "Check database for created records",
    });
  } catch (err) {
    console.error("Ensure records error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// PUT /api/records/:id/pay { mode }
export const markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { mode } = req.body;

    if (!mode || !["Cash", "UPI", "Online"].includes(mode)) {
      return res.status(400).json({ error: "Invalid payment mode" });
    }

    const recordRes = await pool.query(
      "SELECT * FROM monthly_records WHERE id = $1",
      [id],
    );
    if (recordRes.rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const record = recordRes.rows[0];
    if (record.status === "paid") {
      return res
        .status(400)
        .json({ error: "Already paid for this month" });
    }

    const updatedRes = await pool.query(
      `UPDATE monthly_records
       SET status = 'paid',
           payment_mode = $2,
           payment_date = CURRENT_DATE,
           paid_by = 'admin',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, mode],
    );

    res.json(updatedRes.rows[0]);
  } catch (err) {
    console.error("Mark as paid error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

