import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";

dotenv.config();

function mustNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

async function ensureSchema() {
  // Uses the repo's schema.sql so seed can run on fresh DBs
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const schemaPath = path.join(process.cwd(), "config", "schema.sql");
  const sql = await fs.readFile(schemaPath, "utf8");
  await pool.query(sql);
}

async function seed() {
  console.log("Seeding database...");

  await ensureSchema();

  // Clean core tables (order matters because of FKs)
  await pool.query("DELETE FROM notification_recipients");
  await pool.query("DELETE FROM push_tokens");
  await pool.query("DELETE FROM notifications");
  await pool.query("DELETE FROM monthly_records");
  await pool.query("DELETE FROM password_resets");
  await pool.query("DELETE FROM subscription_plans");
  await pool.query("DELETE FROM users");
  await pool.query("DELETE FROM flats");

  // Reset sequences (best-effort)
  await pool.query("ALTER SEQUENCE IF EXISTS flats_id_seq RESTART WITH 1");
  await pool.query("ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1");
  await pool.query("ALTER SEQUENCE IF EXISTS subscription_plans_id_seq RESTART WITH 1");
  await pool.query("ALTER SEQUENCE IF EXISTS monthly_records_id_seq RESTART WITH 1");
  await pool.query("ALTER SEQUENCE IF EXISTS notifications_id_seq RESTART WITH 1");
  await pool.query("ALTER SEQUENCE IF EXISTS push_tokens_id_seq RESTART WITH 1");
  await pool.query("ALTER SEQUENCE IF EXISTS notification_recipients_id_seq RESTART WITH 1");

  // Flats
  const flats = [
    {
      flat_no: "A-101",
      owner_name: "Rahul Sharma",
      email: "resident@society.com",
      phone: "9999999999",
      type: "1BHK",
      is_active: true,
    },
    {
      flat_no: "A-202",
      owner_name: "Priya Verma",
      email: "priya@society.com",
      phone: "8888888888",
      type: "2BHK",
      is_active: true,
    },
    {
      flat_no: "B-303",
      owner_name: "Aman Khan",
      email: "aman@society.com",
      phone: "7777777777",
      type: "3BHK",
      is_active: true,
    },
  ];

  const flatIds = [];
  for (const f of flats) {
    const res = await pool.query(
      `INSERT INTO flats (flat_no, owner_name, email, phone, type, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [f.flat_no, f.owner_name, f.email, f.phone, f.type, f.is_active],
    );
    flatIds.push(res.rows[0].id);
  }

  // Users
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@society.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin123";
  const adminHash = await bcrypt.hash(adminPassword, 10);

  await pool.query(
    `INSERT INTO users (name, email, password, phone, role)
     VALUES ($1, $2, $3, $4, 'admin')`,
    ["Admin", adminEmail, adminHash, "9000000000"],
  );

  const residentPassword = process.env.SEED_RESIDENT_PASSWORD || "user123";
  const residentHash = await bcrypt.hash(residentPassword, 10);

  const residentUsers = [
    { name: "Rahul Sharma", email: "resident@society.com", phone: "9999999999", flat_id: flatIds[0] },
    { name: "Priya Verma", email: "priya@society.com", phone: "8888888888", flat_id: flatIds[1] },
    { name: "Aman Khan", email: "aman@society.com", phone: "7777777777", flat_id: flatIds[2] },
    // A Google-only user: no password set, but email exists (admin provisioned)
    { name: "Google Resident", email: "google.user@society.com", phone: "6666666666", flat_id: flatIds[0], password: null },
  ];

  for (const u of residentUsers) {
    await pool.query(
      `INSERT INTO users (name, email, password, phone, role, flat_id)
       VALUES ($1, $2, $3, $4, 'user', $5)`,
      [u.name, u.email, u.password === null ? null : residentHash, u.phone, u.flat_id],
    );
  }

  // Subscription plans (type-based defaults)
  const plans = [
    { type: "1BHK", amount: mustNumber(process.env.SEED_PLAN_1BHK, 1500) },
    { type: "2BHK", amount: mustNumber(process.env.SEED_PLAN_2BHK, 2200) },
    { type: "3BHK", amount: mustNumber(process.env.SEED_PLAN_3BHK, 3000) },
  ];

  for (const p of plans) {
    await pool.query(
      `INSERT INTO subscription_plans (type, amount)
       VALUES ($1, $2)`,
      [p.type, p.amount],
    );
  }

  // Optional per-flat override example (uses your new flat_id column)
  const overrideAmount = mustNumber(process.env.SEED_FLAT_OVERRIDE_AMOUNT, 1800);
  await pool.query(
    `INSERT INTO subscription_plans (type, amount, flat_id)
     VALUES ($1, $2, $3)`,
    ["1BHK", overrideAmount, flatIds[0]],
  );

  // Monthly records for last 3 months for each flat
  const now = new Date();
  const months = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = String(d.getMonth() + 1).padStart(2, "0");
    months.push(`${d.getFullYear()}-${m}`);
  }

  for (const flatId of flatIds) {
    for (const month of months) {
      // Pick plan amount: prefer flat override, else type plan
      const amtRes = await pool.query(
        `SELECT amount
         FROM subscription_plans
         WHERE flat_id = $1
         ORDER BY updated_at DESC NULLS LAST
         LIMIT 1`,
        [flatId],
      );
      let amount = Number(amtRes.rows[0]?.amount || 0);
      if (!amount) {
        const typeRes = await pool.query("SELECT type FROM flats WHERE id = $1", [flatId]);
        const type = typeRes.rows[0]?.type;
        const planRes = await pool.query("SELECT amount FROM subscription_plans WHERE type = $1 AND flat_id IS NULL LIMIT 1", [type]);
        amount = Number(planRes.rows[0]?.amount || 0);
      }

      const status = month === months[0] ? "pending" : "paid";
      const payment_mode = status === "paid" ? (flatId % 2 === 0 ? "UPI" : "Cash") : "";
      const payment_date = status === "paid" ? new Date() : null;

      await pool.query(
        `INSERT INTO monthly_records (flat_id, month, amount, status, payment_mode, payment_date, paid_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [flatId, month, amount, status, payment_mode, payment_date, status === "paid" ? "resident" : ""],
      );
    }
  }

  // Notifications
  await pool.query(
    `INSERT INTO notifications (title, message, target, date, sent_by)
     VALUES ($1, $2, 'all', CURRENT_DATE, $3)`,
    ["Welcome", "Welcome to the Society portal. Your monthly subscriptions will appear here.", adminEmail],
  );
  await pool.query(
    `INSERT INTO notifications (title, message, target, date, sent_by)
     VALUES ($1, $2, $3, CURRENT_DATE, $4)`,
    ["Flat Notice", "Reminder: Please update your contact details in Profile if needed.", `selected:${flatIds[0]}`, adminEmail],
  );

  // Push tokens (dummy tokens for development)
  await pool.query(
    `INSERT INTO push_tokens (flat_id, fcm_token, device_type)
     VALUES ($1, $2, $3), ($4, $5, $6)`,
    [
      flatIds[0],
      "dev-token-flat-a101",
      "web",
      flatIds[1],
      "dev-token-flat-a202",
      "web",
    ],
  );

  console.log("Seed complete.");
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
  console.log(`Resident login: resident@society.com / ${residentPassword}`);
  console.log("Google-only resident (email exists, no password): google.user@society.com");
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });

