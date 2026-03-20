import { Router } from "express";
import { registerPushToken } from "../controllers/pushTokens.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/validate.js";
import { registerPushTokenBodySchema } from "../validators/pushTokens.validator.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validateRequest({ body: registerPushTokenBodySchema }),
  registerPushToken,
);

export default router;

