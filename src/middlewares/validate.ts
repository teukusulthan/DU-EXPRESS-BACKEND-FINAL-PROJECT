import { Request, Response, NextFunction } from "express";
import { Schema } from "joi";

export function validate(schema: Schema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const toValidate = { body: req.body, params: req.params, query: req.query };
    const { error, value } = schema
      .prefs({ abortEarly: false, stripUnknown: true })
      .validate(toValidate);

    if (error) {
      const err: any = new Error("Validation error");
      err.status = 400;

      err.details = error.details.map((d) => d.message);
      throw err;
    }

    req.body = value.body || req.body;
    req.params = value.params || req.params;
    req.query = value.query || req.query;
    next();
  };
}
