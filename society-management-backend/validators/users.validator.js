import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),

  email: z.string().email("Invalid email"), // ✅ FIXED

  phone: z
    .string()
    .regex(/^[0-9]{10,13}$/, "Phone must be 10–13 digits")
    .optional(),

  password: z.string().min(8, "Password must be at least 8 characters"),

  flatId: z.number(), // ✅ YOU MISSED THIS
});