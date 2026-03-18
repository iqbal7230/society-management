import { Router } from "express";
import {
  getNotifications,
  createNotification,
} from "../controllers/notifications.controller.js";
import { authenticate, adminOnly } from "../middlewares/auth.js";

const router = Router();

router.get("/", authenticate, getNotifications);
router.post("/", authenticate, adminOnly, createNotification);

export default router;

