import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { transferPoints } from "../controllers/points";
import { transferPointsSchema } from "../validators/points";

const router = Router();

router.post(
  "/transfer-point",
  authenticate,
  validate(transferPointsSchema),
  transferPoints
);

export default router;
