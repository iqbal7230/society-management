import { Router } from "express";
import { createUser } from "../controllers/users.controller.js";
import { authenticate, adminOnly } from "../middlewares/auth.js";

const router = Router();

router.post("/", authenticate, adminOnly, createUser);

export default router;

