import Joi from "joi";

const id = Joi.number().integer().positive();
const nonnegInt = Joi.number().integer().min(0);

const intLike = (min?: number) =>
  Joi.alternatives().try(
    Joi.number()
      .integer()
      .min(min ?? 0),
    Joi.string().pattern(/^\d+$/).message("must be a number")
  );

const boolLike = Joi.alternatives().try(
  Joi.boolean(),
  Joi.string().valid("true", "false")
);

export const createProductSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().trim().min(1).required(),
    description: Joi.string().allow("", null),
    price: nonnegInt.required(),
    stock: nonnegInt.required(),
    imageUrl: Joi.string().uri().allow("", null),
  }).required(),
  params: Joi.object({}).unknown(true),
  query: Joi.object({}).unknown(true),
});

// UPDATE
export const updateProductSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().trim().min(1),
    description: Joi.string().allow("", null),
    price: nonnegInt,
    stock: nonnegInt,
    imageUrl: Joi.string().uri().allow("", null),
  })
    .min(1)
    .required(),
  params: Joi.object({ id: id.required() }).required(),
  query: Joi.object({}).unknown(true),
});

export const listProductQuerySchema = Joi.object({
  body: Joi.object({}).unknown(true),
  params: Joi.object({}).unknown(true),
  query: Joi.object({
    q: Joi.string().trim(),
    minPrice: intLike(0),
    maxPrice: intLike(0),
    sortBy: Joi.string().valid("id", "name", "price", "stock", "createdAt"),
    order: Joi.string().valid("asc", "desc"),
    limit: intLike(1),
    offset: intLike(0),
    includeDeleted: boolLike,
  })
    .custom((value, helpers) => {
      const { minPrice, maxPrice } = value;
      if (
        minPrice !== undefined &&
        maxPrice !== undefined &&
        Number(maxPrice) < Number(minPrice)
      ) {
        return helpers.message({ custom: "maxPrice must be >= minPrice" });
      }
      return value;
    })
    .required(),
});

export const getProductParamSchema = Joi.object({
  body: Joi.object({}).unknown(true),
  params: Joi.object({ id: id.required() }).required(),
  query: Joi.object({}).unknown(true),
});

export const deleteProductParamSchema = Joi.object({
  body: Joi.object({}).unknown(true),
  params: Joi.object({ id: id.required() }).required(),
  query: Joi.object({}).unknown(true),
});

export const restoreProductParamSchema = Joi.object({
  body: Joi.object({}).unknown(true),
  params: Joi.object({ id: id.required() }).required(),
  query: Joi.object({}).unknown(true),
});
