import { z } from "zod";
import { singleValue } from "./common.js";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const googleLoginSchema = z.object({
  email: z.string().email(),
  googleId: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(6),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(10).max(15).optional(),
  password: z.string().min(6).optional(),
});

// For GET /api/v1/auth/google (redirect is optional; used only as a hint)
export const googleRedirectQuerySchema = z.object({
  redirect: singleValue(z.string()).optional(),
}).passthrough();

// For GET /api/v1/auth/google/callback (state is optional)
export const googleOAuthCallbackQuerySchema = z.object({
  state: singleValue(z.string()).optional(),
}).passthrough();