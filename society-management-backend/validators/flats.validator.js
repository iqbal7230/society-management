import { z } from "zod";

const positiveInt = z.coerce.number().int().positive();

export const createFlatSchema = z.object({
  flatNo: z.string().min(4).max(5),
  ownerName: z.string().min(1),
  email: z.email(),
  phone: z.string().min(10).max(12),
  type: z.string().min(1),
});

export const updateFlatParamsSchema = z.object({
  id: positiveInt,
});

export const updateFlatBodySchema = z.object({
  flatNo: z.string().min(1).optional(),
  ownerName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
});

export const deleteFlatParamsSchema = z.object({
  id: positiveInt,
});

