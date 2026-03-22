import { Router } from "express";
import {
  getRecords,
  ensureRecords,
  markAsPaid,
} from "../controllers/records.controller.js";
import { authenticate, adminOnly } from "../middlewares/auth.js";

const router = Router();

router.get("/",authenticate, getRecords);
router.post("/ensure", authenticate, adminOnly, ensureRecords);

router.put("/:id/pay", authenticate, adminOnly, markAsPaid);

export default router;

