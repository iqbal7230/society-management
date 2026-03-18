import pool from "../config/db.js";

// GET /api/reports?month=YYYY-MM&year=YYYY
export const getReport = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month && !year) {
      return res
        .status(400)
        .json({ error: "month or year is required for reports" });
    }

    const values = [];
    const where = [];

    if (month) {
      values.push(month);
      where.push(`month = $${values.length}`);
    }

    if (year) {
      values.push(`${year}-`);
      where.push(`month LIKE $${values.length} || '%'`);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // Totals and counts
    const summaryRes = await pool.query(
      `SELECT
         COUNT(*)::int AS total_records,
         SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END)::int AS paid_count,
         SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)::int AS pending_count,
         COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0)::numeric AS total_collected,
         COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0)::numeric AS total_pending
       FROM monthly_records
       ${whereClause}`,
      values,
    );

    const summary = summaryRes.rows[0] || {};

    // Payment mode breakdown
    const modesRes = await pool.query(
      `SELECT payment_mode AS mode,
              COALESCE(SUM(amount), 0)::numeric AS total
       FROM monthly_records
       ${whereClause ? whereClause + " AND status = 'paid'" : "WHERE status = 'paid'"}
       GROUP BY payment_mode`,
      values,
    );

    // Total flats for context
    const flatsRes = await pool.query(
      "SELECT COUNT(*)::int AS total_flats FROM flats WHERE is_active = true",
    );

    res.json({
      totalFlats: flatsRes.rows[0]?.total_flats || 0,
      paidCount: summary.paid_count || 0,
      pendingCount: summary.pending_count || 0,
      totalCollected: Number(summary.total_collected || 0),
      totalPending: Number(summary.total_pending || 0),
      byMode: modesRes.rows.map((r) => ({
        mode: r.mode || "Unknown",
        total: Number(r.total || 0),
      })),
    });
  } catch (err) {
    console.error("Get report error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

