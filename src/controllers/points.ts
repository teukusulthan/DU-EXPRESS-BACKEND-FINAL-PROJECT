import { Request, Response } from "express";
import { prisma } from "../connections/client";

export const transferPoints = async (req: Request, res: Response) => {
  const { amount, receiverId } = req.body as {
    amount: number;
    receiverId: number;
  };

  const auth = (req as any).user as { id: number; role: string } | undefined;
  if (!auth) {
    const err = new Error("Login required");
    (err as any).status = 403;
    throw err;
  }
  const senderId = auth.id;

  if (!Number.isInteger(amount) || amount <= 0) {
    const err = new Error("number of points must be more than 0");
    (err as any).status = 400;
    throw err;
  }
  if (senderId === receiverId) {
    const err = new Error("cannot transfer points to the same user");
    (err as any).status = 400;
    throw err;
  }

  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
  if (!receiver) {
    const err = new Error("Receiver not found");
    (err as any).status = 404;
    throw err;
  }

  const transfer = await prisma.$transaction(async (tx) => {
    const dec = await tx.user.updateMany({
      where: { id: senderId, points: { gte: amount } },
      data: { points: { decrement: amount } },
    });
    if (dec.count === 0) {
      const err = new Error(
        "Sender's points are not enough to make a transfer"
      );
      (err as any).status = 400;
      throw err;
    }

    await tx.user.update({
      where: { id: receiverId },
      data: { points: { increment: amount } },
    });

    return tx.transfer.create({
      data: { fromUserId: senderId, toUserid: receiverId, amount },
    });
  });

  res.status(200).json({
    message: "points transferred successfully",
    data: {
      id: transfer.id,
      senderId,
      receiverId,
      amount,
      createdAt: transfer.createdAt,
    },
  });
};
