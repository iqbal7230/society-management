import admin from "firebase-admin";
import dotenv from "dotenv";
import pool from "../config/db.js";

dotenv.config();

let initialized = false;

function initFirebase() {
  if (initialized) return true;

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (!json) {
    console.warn(
      "FCM not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON (service account JSON string).",
    );
    return false;
  }

  try {
    const serviceAccount = "./service.key.json";
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: projectId || serviceAccount.project_id,
    });
    initialized = true;
    return true;
  } catch (err) {
    console.error("Failed to init Firebase Admin:", err);
    return false;
  }
}

export async function sendPushToFlat(flatId, title, body) {
  if (!initFirebase()) return;

  try {
    const tokensRes = await pool.query(
      "SELECT fcm_token FROM push_tokens WHERE flat_id = $1",
      [flatId],
    );
    const tokens = tokensRes.rows.map((r) => r.fcm_token).filter(Boolean);
    if (!tokens.length) return;

    const message = {
      tokens,
      notification: {
        title: String(title || ""),
        body: String(body || ""),
      },
      data: {
        flatId: String(flatId),
      },
    };

    const resp = await admin.messaging().sendEachForMulticast(message);

    // Clean up invalid tokens (optional but helpful)
    const invalid = [];
    resp.responses.forEach((r, idx) => {
      if (r.success) return;
      const code = r.error?.code || "";
      if (
        code.includes("registration-token-not-registered") ||
        code.includes("invalid-registration-token")
      ) {
        invalid.push(tokens[idx]);
      }
    });

    if (invalid.length) {
      await pool.query("DELETE FROM push_tokens WHERE fcm_token = ANY($1::text[])", [
        invalid,
      ]);
    }
  } catch (err) {
    console.error("sendPushToFlat FCM error:", err);
  }
}

