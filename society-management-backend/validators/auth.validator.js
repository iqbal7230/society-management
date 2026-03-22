import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(10).max(13).optional(),
  password: z.string().min(8).optional(),
});

