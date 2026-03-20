import { z } from "zod";

export const createNotificationBodySchema = z
  .object({
    title: z.string().min(1),
    message: z.string().min(1),
    // Controller normalizes falsy/undefined to "all"
    target: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z.string().min(1).optional(),
    ),
    flatIds: z.array(z.coerce.number().int().positive()).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.target === "selected") {
      if (!val.flatIds || val.flatIds.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["flatIds"],
          message: "flatIds is required when target=selected",
        });
      }
    }
  });

