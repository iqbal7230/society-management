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
      `SELECT * FROM notifications
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
      //allow target to be "all" or comma-separated list
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

    // Populate notification_recipients for read-tracking
    const notificationId = result.rows[0].id;
    const recipientFlatIds =
      normalizedTarget === "all"
        ? (
            await pool.query(
              "SELECT id FROM flats WHERE is_active = true",
            )
          ).rows.map((r) => r.id)
        : selectedFlatIds;

    if (recipientFlatIds.length > 0) {
      const values = recipientFlatIds
        .map((fid, i) => `($1, $${i + 2}, 'unread')`)
        .join(", ");
      await pool.query(
        `INSERT INTO notification_recipients (notification_id, flat_id, read_status)
         VALUES ${values}
         ON CONFLICT DO NOTHING`,
        [notificationId, ...recipientFlatIds],
      );
    }

    // Return stored target for debugging/visibility
    result.rows[0].target = storedTarget;

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create notification error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/notifications/unread-count
export const getUnreadCount = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const flatRes = await pool.query(
      "SELECT flat_id FROM users WHERE id = $1",
      [userId],
    );
    const flatId = flatRes.rows[0]?.flat_id;
    if (!flatId) {
      return res.json({ count: 0 });
    }

    const result = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM notification_recipients
       WHERE flat_id = $1 AND read_status = 'unread'`,
      [flatId],
    );

    res.json({ count: result.rows[0]?.count || 0 });
  } catch (err) {
    console.error("Get unread count error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// PUT /api/notifications/:id/read
export const markAsRead = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const notificationId = Number(req.params.id);

    const flatRes = await pool.query(
      "SELECT flat_id FROM users WHERE id = $1",
      [userId],
    );
    const flatId = flatRes.rows[0]?.flat_id;
    if (!flatId) {
      return res.json({ success: true });
    }

    await pool.query(
      `UPDATE notification_recipients
       SET read_status = 'read'
       WHERE notification_id = $1 AND flat_id = $2`,
      [notificationId, flatId],
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Mark as read error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// PUT /api/notifications/read-all
export const markAllAsRead = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const flatRes = await pool.query(
      "SELECT flat_id FROM users WHERE id = $1",
      [userId],
    );
    const flatId = flatRes.rows[0]?.flat_id;
    if (!flatId) {
      return res.json({ success: true });
    }

    await pool.query(
      `UPDATE notification_recipients
       SET read_status = 'read'
       WHERE flat_id = $1 AND read_status = 'unread'`,
      [flatId],
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Mark all as read error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
