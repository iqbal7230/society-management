import { z } from "zod";
import { singleValue } from "./common.js";

const monthRegex = /^\d{4}-\d{2}$/;
const yearRegex = /^\d{4}$/;

export const getReportQuerySchema = z
  .object({
    month: singleValue(z.string().regex(monthRegex)).optional(),
    year: singleValue(z.string().regex(yearRegex)).optional(),
  })
  .refine((data) => !!data.month || !!data.year, {
    message: "month or year is required for reports",
    path: [],
  });

