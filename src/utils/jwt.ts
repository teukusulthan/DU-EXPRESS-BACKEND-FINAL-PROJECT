import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET as string;

export interface UserPayload {
  id: number;
  role: string;
}

export function signToken(payload: UserPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

export function verifyToken(tokens: string) {
  return jwt.verify(tokens, JWT_SECRET) as UserPayload;
}
