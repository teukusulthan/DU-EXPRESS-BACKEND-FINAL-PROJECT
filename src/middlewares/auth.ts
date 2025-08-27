// src/middlewares/auth.ts
import { Request, Response, NextFunction } from "express";
import { verifyToken, UserPayload } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; role: "SUPPLIER" | "USER" };
    }
  }
}
export {};

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    const err = new Error("Missing or invalid Authorization header");
    (err as any).status = 401;
    throw err;
  }

  try {
    const token = header.slice(7);
    const payload: UserPayload = verifyToken(token);

    if (
      !payload ||
      typeof payload.id !== "number" ||
      typeof payload.role !== "string" ||
      !["SUPPLIER", "USER"].includes(payload.role)
    ) {
      const err = new Error("Invalid token payload");
      (err as any).status = 401;
      throw err;
    }

    req.user = { id: payload.id, role: payload.role as "SUPPLIER" | "USER" };
    next();
  } catch {
    const err = new Error("Invalid token");
    (err as any).status = 401;
    throw err;
  }
}

export function authorize(...roles: ("SUPPLIER" | "USER")[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      const err = new Error("Unauthenticated");
      (err as any).status = 401;
      throw err;
    }

    if (!roles.includes(req.user.role)) {
      const err = new Error("Forbidden");
      (err as any).status = 403;
      throw err;
    }

    next();
  };
}
