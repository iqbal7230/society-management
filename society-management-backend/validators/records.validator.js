import { z } from "zod";
import { singleValue } from "./common.js";

const monthRegex = /^\d{4}-\d{2}$/;
const positiveInt = z.coerce.number().int().positive();

export const getRecordsQuerySchema = z.object({
  month: singleValue(z.string().regex(monthRegex)).optional(),
  flatId: z
    .preprocess(
      (v) => (Array.isArray(v) ? v[0] : v === "" || v == null ? undefined : v),
      positiveInt.optional(),
    )
    .optional(),
});

export const ensureRecordsBodySchema = z.object({
  month: z.string().regex(monthRegex),
});

export const markAsPaidParamsSchema = z.object({
  id: positiveInt,
});

export const markAsPaidBodySchema = z.object({
  mode: z.enum(["Cash", "UPI", "Online"]),
});

