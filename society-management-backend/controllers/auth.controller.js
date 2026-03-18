import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import dotenv from "dotenv";
import crypto from "crypto";
import { sendEmail } from "../utils/email.js";

dotenv.config();

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    if (!user.password) {
      return res
        .status(401)
        .json({ error: "Please sign in with Google for this account" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...safeUser } = user;

    res.json({ token, user: safeUser });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


export const googleLogin = async (req, res) => {
  try {
    const { googleId, email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR google_id = $2",
      [email, googleId]
    );

    // Only allow Google sign-in for users that already exist.
    // This means an admin must have provisioned the user (email) beforehand.
    if (existingUser.rows.length === 0) {
      return res
        .status(401)
        .json({ error: "Email not found. Please contact your admin." });
    }

    let user = existingUser.rows[0];

    // Link Google account to existing user record if not already linked
    if (!user.google_id && googleId) {
      await pool.query(
        "UPDATE users SET google_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        [googleId, user.id]
      );

      user.google_id = googleId;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...safeUser } = user;

    res.json({ token, user: safeUser });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/v1/auth/google/callback (Passport)
export const googleOAuthCallback = async (req, res) => {
  try {
    const clientBase = process.env.CLIENT_URL || "http://localhost:3000";
    let redirectTo = `${clientBase}/auth/callback`;

    // Handle dynamic redirect (state or session)
    const state = typeof req.query?.state === "string" ? req.query.state : "";
    if (state) {
      try {
        const decoded = Buffer.from(state, "base64url").toString("utf8");
        if (decoded.startsWith("http://") || decoded.startsWith("https://")) {
          redirectTo = decoded;
        }
      } catch {
        // ignore invalid state
      }
    } else if (req.session?.oauthRedirect) {
      redirectTo = String(req.session.oauthRedirect);
    }

    const googleId = req.user?.googleId;
    const email = req.user?.email;
    const name = req.user?.name;

    if (!email) {
      return res.redirect(`${redirectTo}?error=missing_email`);
    }

    // ✅ STEP 1: Find user by email (IMPORTANT: not OR query)
    const userRes = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userRes.rows.length === 0) {
      return res.redirect(`${redirectTo}?error=email_not_found`);
    }

    let user = userRes.rows[0];

    // ✅ STEP 2: Link google_id if not already linked
    if (!user.google_id && googleId) {
      await pool.query(
        `UPDATE users 
         SET google_id = $1, 
             name = COALESCE(name, $2), 
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $3`,
        [googleId, name || user.name, user.id]
      );

      // ✅ IMPORTANT: re-fetch updated user
      const updatedUserRes = await pool.query(
        "SELECT * FROM users WHERE id = $1",
        [user.id]
      );

      user = updatedUserRes.rows[0];
    }

    // ✅ STEP 3: Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...safeUser } = user;

    // ✅ STEP 4: Redirect to frontend with token + role
    const base = redirectTo.includes("?") ? `${redirectTo}&` : `${redirectTo}?`;

    return res.redirect(
      `${base}token=${encodeURIComponent(token)}&role=${encodeURIComponent(
        safeUser.role
      )}`
    );
  } catch (err) {
    console.error("Google OAuth callback error:", err);

    const clientBase = process.env.CLIENT_URL || "http://localhost:3000";
    return res.redirect(`${clientBase}/auth/callback?error=oauth_failed`);
  }
};


export const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, role, flat_id, google_id, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


export const updateProfile = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }

    if (phone) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(phone);
    }

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      updates.push(`password = $${paramIndex++}`);
      values.push(hash);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.user.id);

    const result = await pool.query(
      `UPDATE users SET ${updates.join(", ")}
       WHERE id = $${paramIndex}
       RETURNING id, name, email, phone, role, flat_id, google_id`,
      values
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Ensure table exists (helps when DB wasn't re-seeded)
    await pool.query(
      `CREATE TABLE IF NOT EXISTS password_resets (
         id SERIAL PRIMARY KEY,
         user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
         token_hash VARCHAR(255) NOT NULL,
         expires_at TIMESTAMP NOT NULL,
         used_at TIMESTAMP,
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
       )`,
    );

    const userRes = await pool.query(
      "SELECT id, email, role FROM users WHERE email = $1",
      [email],
    );

    // Always return success to prevent user enumeration
    if (userRes.rows.length === 0) {
      return res.json({ message: "If the email exists, a reset link was sent." });
    }

    const user = userRes.rows[0];

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await pool.query(
      `INSERT INTO password_resets (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt],
    );

    const base = process.env.CLIENT_URL || "http://localhost:3000";
    const path = user.role === "admin" ? "/admin/reset-password" : "/reset-password";
    const link = `${base}${path}?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your Society account password",
      text: `Use this link to reset your password (valid for 30 minutes): ${link}`,
    });

    return res.json({ message: "If the email exists, a reset link was sent." });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: "token and newPassword are required" });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const resetRes = await pool.query(
      `SELECT * FROM password_resets
       WHERE token_hash = $1 AND used_at IS NULL
       ORDER BY created_at DESC
       LIMIT 1`,
      [tokenHash],
    );

    if (resetRes.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const reset = resetRes.rows[0];
    if (new Date(reset.expires_at).getTime() < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [hash, reset.user_id],
    );
    await pool.query(
      "UPDATE password_resets SET used_at = CURRENT_TIMESTAMP WHERE id = $1",
      [reset.id],
    );

    return res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};