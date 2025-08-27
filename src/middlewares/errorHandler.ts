import { Request, Response, NextFunction } from "express";
import multer from "multer";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err.status || err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  const details = Array.isArray(err.details) ? err.details : undefined;

  res.status(status).json({
    code: status,
    status: "error",
    message,
    ...(details ? { details } : {}),
  });
}
