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
  const cookieToken = req.cookies?.token as string | undefined;

  let headerToken: string | null = null;
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) headerToken = header.slice(7);

  const token = cookieToken || headerToken;

  if (!token) {
    const e: any = new Error("Unauthorized: no token");
    e.status = 401;
    throw e;
  }

  try {
    const payload: UserPayload = verifyToken(token);
    if (
      !payload ||
      typeof payload.id !== "number" ||
      !["SUPPLIER", "USER"].includes(payload.role)
    ) {
      const e: any = new Error("Invalid token payload");
      e.status = 401;
      throw e;
    }
    req.user = { id: payload.id, role: payload.role as "SUPPLIER" | "USER" };
    next();
  } catch {
    const e: any = new Error("Invalid token");
    e.status = 401;
    throw e;
  }
}

export function authorize(...roles: ("SUPPLIER" | "USER")[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      const e: any = new Error("Unauthenticated");
      e.status = 401;
      throw e;
    }
    if (!roles.includes(req.user.role)) {
      const e: any = new Error("Forbidden");
      e.status = 403;
      throw e;
    }
    next();
  };
}
