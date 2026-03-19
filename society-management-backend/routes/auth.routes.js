import { Router } from "express";
import passport from "passport";
import {
  login,
  googleLogin,
  googleOAuthCallback,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  logout,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.post("/login", login);

router.post("/google-login", googleLogin);

// Google OAuth (Passport)
router.get("/google", (req, res, next) => {
  const redirect = req.query.redirect ? String(req.query.redirect) : "";
  const state = redirect ? Buffer.from(redirect, "utf8").toString("base64url") : "";
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state,
  })(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect:
      (process.env.CLIENT_URL || "http://localhost:3000") +
      "/auth/callback?error=google_failed",
  }),
  googleOAuthCallback,
);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/me", authenticate, getMe);

router.put("/profile", authenticate, updateProfile);

router.post("/logout", logout);

export default router;