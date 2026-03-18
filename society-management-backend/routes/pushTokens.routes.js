import { Router } from "express";
import { registerPushToken } from "../controllers/pushTokens.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.post("/", authenticate, registerPushToken);

export default router;

