import { z } from "zod";



export const createFlatSchema = z.object({
  flatNo: z.string().min(4).max(5),
  ownerName: z.string().min(3),
  email: z.email(),
  phone: z.string().min(10).max(13),
  type: z.string().min(1),
});



export const updateFlatBodySchema = z.object({
  flatNo: z.string().min(1).optional(),
  ownerName: z.string().min(3).optional(),
  email: z.email().optional(),
  phone: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
});


