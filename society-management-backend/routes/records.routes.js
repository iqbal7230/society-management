import { Router } from "express";
import {
  getRecords,
  ensureRecords,
  markAsPaid,
} from "../controllers/records.controller.js";
import { authenticate, adminOnly } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/validate.js";
import {
  ensureRecordsBodySchema,
  getRecordsQuerySchema,
  markAsPaidBodySchema,
  markAsPaidParamsSchema,
} from "../validators/records.validator.js";

const router = Router();

router.get(
  "/",
  authenticate,
  validateRequest({ query: getRecordsQuerySchema }),
  getRecords,
);
router.post(
  "/ensure",
  authenticate,
  adminOnly,
  validateRequest({ body: ensureRecordsBodySchema }),
  ensureRecords,
);
router.put(
  "/:id/pay",
  authenticate,
  adminOnly,
  validateRequest({ params: markAsPaidParamsSchema, body: markAsPaidBodySchema }),
  markAsPaid,
);

export default router;

