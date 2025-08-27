import Joi from "joi";

export const transferPointsSchema = Joi.object({
  body: Joi.object({
    receiverId: Joi.number().integer().positive().required(),
    amount: Joi.number().integer().min(1).required(),
  }).required(),
});
