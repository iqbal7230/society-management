import { Router } from "express";
import { createUser } from "../controllers/users.controller.js";
import { authenticate, adminOnly } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/validate.js";
import { createUserSchema } from "../validators/users.validator.js";

const router = Router();

router.post("/",authenticate, adminOnly, validateRequest({ body: createUserSchema }),
  createUser,
);

export default router;

