import { Router } from "express";
import {getFlats, createFlat, updateFlat, deleteFlat} from "../controllers/flats.controller.js";
import { getMyFlat } from "../controllers/flats.me.controller.js";
import { authenticate, adminOnly } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/validate.js";
import { createFlatSchema, updateFlatBodySchema} from "../validators/flats.validator.js";

const router = Router();

router.get("/", authenticate, adminOnly, getFlats);
router.get("/me", authenticate, getMyFlat);
router.post("/", authenticate, adminOnly,
  validateRequest({ body: createFlatSchema }),
  createFlat,
);

router.put("/:id", authenticate, adminOnly,
  validateRequest({body: updateFlatBodySchema }),
  updateFlat,
);
router.delete("/:id", authenticate, adminOnly, deleteFlat,
);

export default router;

