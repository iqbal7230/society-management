import { Router } from "express";
import {
  getNotifications,
  createNotification,
} from "../controllers/notifications.controller.js";
import { authenticate, adminOnly } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/validate.js";
import { createNotificationBodySchema } from "../validators/notifications.validator.js";

const router = Router();

router.get("/", authenticate, getNotifications);
router.post(
  "/",
  authenticate,
  adminOnly,
  validateRequest({ body: createNotificationBodySchema }),
  createNotification,
);

export default router;

