import { Router } from "express";
import { register, login, logout } from "../controllers/auth";
import { validate } from "../middlewares/validate";
import { upload } from "../middlewares/multer";
import multer from "multer";
import { registerSchema, loginSchema } from "../validators/auth";
import { authenticate } from "../middlewares/auth";

const router = Router();
const noFiles = multer().none();

router.post(
  "/register",
  upload.single("avatarUrl"),
  validate(registerSchema),
  register
);
router.post("/login", noFiles, validate(loginSchema), login);

router.post("/logout", authenticate, logout);

export default router;
