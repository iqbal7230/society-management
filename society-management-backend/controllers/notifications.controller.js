import pool from "../config/db.js";
import { sendPushToFlat } from "../utils/fcm.js";
import { sendEmail } from "../utils/email.js";

// GET /api/notifications
export const getNotifications = async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    if (role === "admin") {
      const result = await pool.query(
        "SELECT * FROM notifications ORDER BY date DESC, created_at DESC",
      );
      return res.json(result.rows);
    }

    // Resident: show 'all' plus any selected notifications for their flat
    const flatRes = await pool.query(
      "SELECT flat_id FROM users WHERE id = $1",
      [userId],
    );
    const flatId = flatRes.rows[0]?.flat_id;
    if (!flatId) {
      return res.json([]);
    }

    const result = await pool.query(
      `SELECT *
       FROM notifications
       WHERE target = 'all'
          OR target = $1
          OR (
               target LIKE 'selected:%'
               AND (',' || REPLACE(target, 'selected:', '') || ',') LIKE $2
             )
       ORDER BY date DESC, created_at DESC`,
      [
        `selected:${flatId}`,
        `%,${flatId},%`,
      ],
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// POST /api/notifications { title, message, target }
export const createNotification = async (req, res) => {
  try {
    const { title, message, target, flatIds } = req.body;
    const { email } = req.user;

    if (!title || !message) {
      return res
        .status(400)
        .json({ error: "title and message are required" });
    }

    let normalizedTarget = target || "all";
    let selectedFlatIds = Array.isArray(flatIds)
      ? flatIds.map((x) => Number(x)).filter((x) => Number.isFinite(x))
      : [];

    if (normalizedTarget === "all") {
      selectedFlatIds = [];
    } else if (normalizedTarget === "selected") {
      if (selectedFlatIds.length === 0) {
        return res
          .status(400)
          .json({ error: "flatIds is required when target=selected" });
      }
    } else {
      // Backward compatible: allow target to be "all" or comma-separated list
      const parts = String(normalizedTarget)
        .split(",")
        .map((p) => Number(p.trim()))
        .filter((n) => Number.isFinite(n));
      if (parts.length > 0) {
        normalizedTarget = "selected";
        selectedFlatIds = parts;
      } else {
        normalizedTarget = "all";
        selectedFlatIds = [];
      }
    }

    const storedTarget =
      normalizedTarget === "all"
        ? "all"
        : `selected:${selectedFlatIds.join(",")}`;

    const result = await pool.query(
      `INSERT INTO notifications (title, message, target, date, sent_by)
       VALUES ($1, $2, $3, CURRENT_DATE, $4)
       RETURNING *`,
      [title, message, storedTarget, email],
    );

    // Build recipients: prefer users linked to flats, fall back to flats.email
    let recipients = [];
    if (normalizedTarget === "all") {
      const usersRes = await pool.query(
        "SELECT email FROM users WHERE role = 'user' AND email IS NOT NULL AND email <> ''",
      );
      recipients = usersRes.rows.map((r) => r.email).filter(Boolean);
    } else {
      const usersRes = await pool.query(
        `SELECT email FROM users
         WHERE role = 'user' AND flat_id = ANY($1::int[])
           AND email IS NOT NULL AND email <> ''`,
        [selectedFlatIds],
      );
      recipients = usersRes.rows.map((r) => r.email).filter(Boolean);

      if (recipients.length === 0) {
        const flatsRes = await pool.query(
          `SELECT email FROM flats
           WHERE id = ANY($1::int[])
             AND email IS NOT NULL AND email <> ''`,
          [selectedFlatIds],
        );
        recipients = flatsRes.rows.map((r) => r.email).filter(Boolean);
      }
    }

    // Send emails template 
    const unique = Array.from(new Set(recipients));
    await Promise.all(
      unique.map((to) =>
        sendEmail({
          to,
          subject: title,
          text: `${message}\n\n— Society Management`,
        }).catch(() => null),
      ),
    );

    // Fire push notifications via Supabase for each affected flat
    const pushFlatIds =
      normalizedTarget === "all"
        ? (
            await pool.query(
              "SELECT id FROM flats WHERE is_active = true",
            )
          ).rows.map((r) => r.id)
        : selectedFlatIds;

    await Promise.all(
      pushFlatIds.map((fid) =>
        sendPushToFlat(fid, title, message),
      ),
    );

    // Return stored target for debugging/visibility
    result.rows[0].target = storedTarget;

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create notification error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

