import pool from "../config/db.js";

export const getPlans = async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM subscription_plans ORDER BY type, flat_id NULLS FIRST",
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get plans error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/plans/my (resident)
// Returns the monthly subscription amount for the logged-in user's flat.
export const getMyPlan = async (req, res) => {
  try {
    const userRes = await pool.query(
      "SELECT flat_id FROM users WHERE id = $1",
      [req.user.id],
    );

    const flatId = userRes.rows[0]?.flat_id;
    if (!flatId) {
      return res
        .status(404)
        .json({ error: "No flat assigned to this user" });
    }

    // Prefer a plan mapped directly to this flat via flat_id
    let planRes = await pool.query(
      "SELECT * FROM subscription_plans WHERE flat_id = $1 ORDER BY updated_at DESC NULLS LAST LIMIT 1",
      [flatId],
    );

    // Fallback: if no flat-specific plan, derive from flat type
    if (planRes.rows.length === 0) {
      const flatRes = await pool.query(
        "SELECT type FROM flats WHERE id = $1",
        [flatId],
      );

      if (flatRes.rows.length === 0) {
        return res.status(404).json({ error: "Flat not found" });
      }

      const flatType = flatRes.rows[0].type;

      planRes = await pool.query(
        "SELECT * FROM subscription_plans WHERE type = $1",
        [flatType],
      );
    }

    if (planRes.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "No subscription plan configured for this flat" });
    }

    const plan = planRes.rows[0];

    return res.json({
      type: plan.type,
      amount: plan.amount,
      plan,
    });
  } catch (err) {
    console.error("Get my plan error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const upsertPlan = async (req, res) => {
  try {
    const { type } = req.params;
    const { amount, flatId } = req.body;

    if (!amount || isNaN(Number(amount))) {
      return res.status(400).json({ error: "Valid amount is required" });
    }

    const normalizedFlatId =
      flatId === undefined || flatId === null || flatId === ""
        ? null
        : Number(flatId);

    if (normalizedFlatId !== null && !Number.isFinite(normalizedFlatId)) {
      return res.status(400).json({ error: "flatId must be a number" });
    }

    const existing = await pool.query(
      "SELECT * FROM subscription_plans WHERE type = $1 AND flat_id IS NOT DISTINCT FROM $2",
      [type, normalizedFlatId],
    );

    let plan;
    if (existing.rows.length > 0) {
      const result = await pool.query(
        `UPDATE subscription_plans
         SET amount = $2, updated_at = CURRENT_TIMESTAMP
         WHERE type = $1 AND flat_id IS NOT DISTINCT FROM $3
         RETURNING *`,
        [type, amount, normalizedFlatId],
      );
      plan = result.rows[0];
    } else {
      const result = await pool.query(
        `INSERT INTO subscription_plans (type, amount, flat_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [type, amount, normalizedFlatId],
      );
      plan = result.rows[0];
    }

    res.json({ plan, message: "Plan saved successfully" });
  } catch (err) {
    console.error("Upsert plan error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

