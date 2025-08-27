import { Request, Response } from "express";
import { prisma } from "../connections/client";
import { hashPassword, comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";

export async function register(req: Request, res: Response) {
  const { name, email, password, role } = req.body as {
    name: string;
    email: string;
    password: string;
    role?: "SUPPLIER" | "USER";
  };

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: "Email already used" });

  const passwordHash = await hashPassword(password);

  const avatarUrl = req.file?.filename;

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: passwordHash,
      role: role ?? "USER",
      avatarUrl: avatarUrl,
    },
  });

  res.status(201).json({ message: "Registered", user });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email: string; password: string };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await comparePassword(password, user.password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = signToken({ id: user.id, role: user.role });
  res.json({ token });
}
