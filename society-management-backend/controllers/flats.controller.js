import pool from "../config/db.js";

// Get all active flats
export const getFlats = async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM flats WHERE is_active = true ORDER BY id",
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get flats error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Create a new flat
export const createFlat = async (req, res) => {
  try {
    const { flatNo, ownerName, email, phone, type } = req.body;

    if (!flatNo || !ownerName || !type) {
      return res
        .status(400)
        .json({ error: "flatNo, ownerName and type are required" });
    }

    const result = await pool.query(
      `INSERT INTO flats (flat_no, owner_name, email, phone, type, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING *`,
      [flatNo, ownerName, email || null, phone || null, type],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create flat error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update a flat
export const updateFlat = async (req, res) => {
  try {
    const { id } = req.params;
    const { flatNo, ownerName, email, phone, type } = req.body;

    const updates = [];
    const values = [];
    let idx = 1;

    if (flatNo !== undefined) {
      updates.push(`flat_no = $${idx++}`);
      values.push(flatNo);
    }
    if (ownerName !== undefined) {
      updates.push(`owner_name = $${idx++}`);
      values.push(ownerName);
    }
    if (email !== undefined) {
      updates.push(`email = $${idx++}`);
      values.push(email);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${idx++}`);
      values.push(phone);
    }
    if (type !== undefined) {
      updates.push(`type = $${idx++}`);
      values.push(type);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);

    const result = await pool.query(
      `UPDATE flats SET ${updates.join(", ")}
       WHERE id = $${idx}
       RETURNING *`,
      values,
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Flat not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update flat error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete or soft-delete a flat
export const deleteFlat = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if there are any monthly records for this flat
    const records = await pool.query(
      "SELECT COUNT(*)::int AS count FROM monthly_records WHERE flat_id = $1",
      [id],
    );
    const hasRecords = records.rows[0]?.count > 0;

    if (hasRecords) {
      // Soft delete: mark inactive
      const result = await pool.query(
        `UPDATE flats
         SET is_active = false, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Flat not found" });
      }

      return res.json({
        message:
          "Flat has existing payment records and was marked inactive instead of being deleted.",
        softDeleted: true,
        flat: result.rows[0],
      });
    }

    // No records: hard delete
    const result = await pool.query(
      "DELETE FROM flats WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Flat not found" });
    }

    return res.json({
      message: "Flat deleted successfully.",
      softDeleted: false,
    });
  } catch (err) {
    console.error("Delete flat error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

