import { z } from "zod";

const monthRegex = /^\d{4}-\d{2}$/;
const positiveInt = z.coerce.number().int().positive();

export const addPaymentBodySchema = z.object({
  flatId: positiveInt,
  month: z.string().regex(monthRegex),
  amount: z.coerce.number().finite().positive(),
  mode: z.enum(["Cash", "UPI", "Online"]),
});

