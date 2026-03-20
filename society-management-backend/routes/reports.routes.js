import { Router } from "express";
import { getReport } from "../controllers/reports.controller.js";
import { authenticate, adminOnly } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/validate.js";
import { getReportQuerySchema } from "../validators/reports.validator.js";

const router = Router();

router.get(
  "/",
  authenticate,
  adminOnly,
  validateRequest({ query: getReportQuerySchema }),
  getReport,
);

export default router;

