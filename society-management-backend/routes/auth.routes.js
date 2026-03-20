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
import { validateRequest } from "../middlewares/validate.js";
import {
  forgotPasswordSchema,
  googleLoginSchema,
  googleOAuthCallbackQuerySchema,
  googleRedirectQuerySchema,
  loginSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from "../validators/auth.validator.js";

const router = Router();

router.post("/login", validateRequest({ body: loginSchema }), login);

router.post(
  "/google-login",
  validateRequest({ body: googleLoginSchema }),
  googleLogin,
);

// Google OAuth (Passport)
router.get(
  "/google",
  validateRequest({ query: googleRedirectQuerySchema }),
  (req, res, next) => {
  const redirect = req.query.redirect ? String(req.query.redirect) : "";
  const state = redirect ? Buffer.from(redirect, "utf8").toString("base64url") : "";
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state,
  })(req, res, next);
},
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect:
      (process.env.CLIENT_URL || "http://localhost:3000") +
      "/auth/callback?error=google_failed",
  }),
  validateRequest({ query: googleOAuthCallbackQuerySchema }),
  googleOAuthCallback,
);

router.post(
  "/forgot-password",
  validateRequest({ body: forgotPasswordSchema }),
  forgotPassword,
);
router.post(
  "/reset-password",
  validateRequest({ body: resetPasswordSchema }),
  resetPassword,
);

router.get("/me", authenticate, getMe);

router.put(
  "/profile",
  authenticate,
  validateRequest({ body: updateProfileSchema }),
  updateProfile,
);

router.post("/logout", logout);

export default router;