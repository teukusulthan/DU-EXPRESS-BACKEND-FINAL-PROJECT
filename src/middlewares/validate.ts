import { Request, Response, NextFunction } from "express";
import { Schema } from "joi";

export function validate(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const toValidate = { body: req.body, params: req.params, query: req.query };
    const { error, value } = schema
      .prefs({ abortEarly: false, stripUnknown: true })
      .validate(toValidate);
    if (error)
      return res
        .status(400)
        .json({ error: error.details.map((d) => d.message) });
    req.body = value.body || req.body;
    req.params = value.params || req.params;
    req.query = value.query || req.query;
    next();
  };
}
