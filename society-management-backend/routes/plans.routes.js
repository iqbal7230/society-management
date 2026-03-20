import { Router } from "express";
import { getPlans, getMyPlan, upsertPlan } from "../controllers/plans.controller.js";
import { authenticate, adminOnly } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/validate.js";
import { upsertPlanParamsSchema, upsertPlanBodySchema } from "../validators/plans.validator.js";

const router = Router();

router.get("/", authenticate, adminOnly, getPlans);
router.get("/my", authenticate, getMyPlan);
router.put(
  "/:type",
  authenticate,
  adminOnly,
  validateRequest({ params: upsertPlanParamsSchema, body: upsertPlanBodySchema }),
  upsertPlan,
);

export default router;

