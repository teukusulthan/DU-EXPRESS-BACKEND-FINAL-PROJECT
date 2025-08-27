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
  if (exists) {
    const err = new Error("Email already used");
    (err as any).status = 409;
    throw err;
  }

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
  if (!user)
    if (!user) {
      const err = new Error(
        "User not found, make sure the email is registered"
      );
      (err as any).status = 404;
      throw err;
    }

  const ok = await comparePassword(password, user.password);
  if (!ok) {
    const err = new Error("Wrong password");
    (err as any).status = 401;
    throw err;
  }

  const token = signToken({ id: user.id, role: user.role });

  res
    .cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
    })
    .status(200)
    .json({
      code: 200,
      status: "success",
      message: "Login success",
      data: { token },
    });
}

export async function logout(req: Request, res: Response) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });

  res.status(200).json({
    code: 200,
    status: "success",
    message: "Logged out successfully",
  });
}
