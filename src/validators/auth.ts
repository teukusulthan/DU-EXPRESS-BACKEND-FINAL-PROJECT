import Joi from "joi";

export const registerSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid("SUPPLIER", "USER").default("USER"),
  }),
  params: Joi.object({}),
  query: Joi.object({}),
});

export const loginSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  params: Joi.object({}),
  query: Joi.object({}),
});
