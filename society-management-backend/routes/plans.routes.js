import { Router } from "express";
import { getPlans, getMyPlan, upsertPlan } from "../controllers/plans.controller.js";
import { authenticate, adminOnly } from "../middlewares/auth.js";

const router = Router();

router.get("/", authenticate, adminOnly, getPlans);
router.get("/my", authenticate, getMyPlan);
router.put("/:type", authenticate, adminOnly, upsertPlan);

export default router;

