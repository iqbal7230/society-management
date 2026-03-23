import bcrypt from "bcryptjs";
import pool from "../config/db.js";

// POST /api/users (admin only)
// Creates a resident user (owner) linked to a flat.
// Zod validation is handled by the validateRequest middleware in the route.
export const createUser = async (req, res) => {
  try {
    const { name, email, phone, password, flatId } = req.body;

    const flatRes = await pool.query(
      "SELECT id, flat_no, type, is_active FROM flats WHERE id = $1",
      [flatId],
    );
    if (flatRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Flat not found",
      });
    }
    if (!flatRes.rows[0].is_active) {
      return res.status(400).json({
        success: false,
        message: "Flat is inactive",
      });
    }

    const existingForFlat = await pool.query(
      "SELECT id FROM users WHERE flat_id = $1 AND role = 'user' LIMIT 1",
      [flatId],
    );
    if (existingForFlat.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "A resident user already exists for this flat",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, phone, role, flat_id)
       VALUES ($1, $2, $3, $4, 'user', $5)
       RETURNING id, name, email, phone, role, flat_id, google_id, created_at`,
      [name, email, passwordHash, phone || "", flatId],
    );

    // Keep flat contact details aligned (best-effort)
    await pool.query(
      `UPDATE flats
       SET owner_name = $2,
           email = $3,
           phone = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [flatId, name, email, phone || ""],
    );

    res.status(201).json({
      success: true,
      message: "Resident user created successfully",
      data: result.rows[0],
    });
  } catch (err) {
    const msg = err?.message || "";
    if (msg.includes("users_email_key")) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }
    console.error("Create user error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
