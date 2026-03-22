import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(3),
  email: z.email(),
  phone: z.string().min(10).max(13),
  password: z.string().min(8),

});

