import { Router } from "express";
import { addPayment } from "../controllers/payments.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/validate.js";
import { addPaymentBodySchema } from "../validators/payments.validator.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validateRequest({ body: addPaymentBodySchema }),
  addPayment,
);

export default router;

