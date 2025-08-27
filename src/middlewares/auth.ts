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

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or invalid Authorization header" });
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
      return res.status(401).json({ error: "Invalid token payload" });
    }

    req.user = { id: payload.id, role: payload.role as "SUPPLIER" | "USER" };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function authorize(...roles: ("SUPPLIER" | "USER")[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Unauthenticated" });
    if (!roles.includes(req.user.role))
      return res.status(403).json({ error: "Forbidden" });
    next();
  };
}
