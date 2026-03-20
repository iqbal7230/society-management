import { z } from "zod";

export const registerPushTokenBodySchema = z.object({
  token: z.string().min(1),
  deviceType: z.string().min(1).optional(),
});

