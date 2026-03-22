import { Router } from "express";
import { addPayment } from "../controllers/payments.controller.js";
import { authenticate } from "../middlewares/auth.js";


const router = Router();

router.post("/", authenticate,addPayment);

export default router;

