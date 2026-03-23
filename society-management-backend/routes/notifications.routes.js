import { Router } from "express";
import {
  getNotifications,
  createNotification,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../controllers/notifications.controller.js";
import { authenticate, adminOnly } from "../middlewares/auth.js";


const router = Router();

router.get("/", authenticate, getNotifications);
router.get("/unread-count", authenticate, getUnreadCount);
router.put("/read-all", authenticate, markAllAsRead);
router.put("/:id/read", authenticate, markAsRead);
router.post("/", authenticate, adminOnly, createNotification);

export default router;
