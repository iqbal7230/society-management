import { Router } from "express";
import { getReport } from "../controllers/reports.controller.js";
import { authenticate, adminOnly } from "../middlewares/auth.js";

const router = Router();

router.get("/", authenticate, adminOnly, getReport);

export default router;

