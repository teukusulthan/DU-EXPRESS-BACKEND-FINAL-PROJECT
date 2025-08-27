import Joi from "joi";

export const createOrderSchema = Joi.object({
  body: Joi.object({
    productId: Joi.number().integer().positive().required(),
    quantity: Joi.number().integer().positive().required(),
  }).required(),
});

export const getOrdersQuerySchema = Joi.object({
  query: Joi.object({
    userId: Joi.number().integer().positive().optional(),
    productId: Joi.number().integer().positive().optional(),

    minTotal: Joi.number().integer().min(0).optional(),
    maxTotal: Joi.number().integer().min(0).optional(),

    sortBy: Joi.string()
      .valid("createdAt", "totalPrice", "quantity")
      .optional(),
    order: Joi.string().valid("asc", "desc").optional(),

    limit: Joi.number().integer().min(1).max(100).optional(),
    offset: Joi.number().integer().min(0).optional(),

    from: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    to: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  }).required(),
});
