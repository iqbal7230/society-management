import { z } from "zod";



export const createFlatSchema = z.object({
  flatNo: z
    .string()
    .min(4, "Flat number must be at least 4 characters")
    .max(5, "Flat number must be at most 5 characters"),

  ownerName: z
    .string()
    .min(3, "Owner name must be at least 3 characters"),

  email: z
    .string()
    .email("Invalid email")
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone must be exactly 10 digits")
    .optional()
    .or(z.literal("")),

  type: z.enum(["1BHK", "2BHK", "3BHK"]),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
});

export const updateFlatBodySchema = z.object({
  flatNo: z.string().min(4).max(5),
  ownerName: z.string().min(3),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone must be exactly 10 digits").optional().or(z.literal("")),
  type: z.enum(["1BHK", "2BHK", "3BHK"]),
});
