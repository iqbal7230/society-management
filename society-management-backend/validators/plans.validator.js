import { z } from "zod";

export const upsertPlanParamsSchema = z.object({
  type: z.string().min(1),
});

export const upsertPlanBodySchema = z.object({
  amount: z.coerce.number().finite().positive(),
  flatId: z
    .preprocess(
      (v) => (v === "" ? null : v),
      z.union([z.coerce.number().int().positive(), z.null()]).optional(),
    ),
});

