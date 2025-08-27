import { Router } from "express";
import { register, login } from "../controllers/auth";
import { validate } from "../middlewares/validate";
import { upload } from "../middlewares/multer";
import Joi from "joi";

const router = Router();

const registerSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid("SUPPLIER", "USER").default("USER"),
  }),
  params: Joi.object({}),
  query: Joi.object({}),
});

const loginSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  params: Joi.object({}),
  query: Joi.object({}),
});

router.post(
  "/register",
  upload.single("avatarUrl"),
  validate(registerSchema),
  register
);
router.post("/login", validate(loginSchema), login);

export default router;
