import { Request, Response } from "express";
import { prisma } from "../connections/client";

function toInt(v: unknown, def: number) {
  const n = typeof v === "number" ? v : parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : def;
}

export async function createOrder(req: Request, res: Response) {
  const auth = (req as any).user as { id: number; role: string } | undefined;
  if (!auth) {
    const err = new Error("Login required");
    (err as any).status = 403;
    throw err;
  }

  const { productId, quantity } = req.body as {
    productId: number;
    quantity: number;
  };

  if (!productId || !quantity || quantity <= 0) {
    const err = new Error("productId and positive quantity are required");
    (err as any).status = 400;
    throw err;
  }

  const order = await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: productId },
      select: { id: true, price: true, stock: true, deletedAt: true },
    });

    if (!product || product.deletedAt) {
      const err = new Error("Product not found");
      (err as any).status = 404;
      throw err;
    }

    if (quantity > product.stock) {
      const err = new Error("Insufficient stock");
      (err as any).status = 400;
      throw err;
    }

    const unitPrice = product.price;
    const totalPrice = unitPrice * quantity;

    const created = await tx.order.create({
      data: {
        userId: auth.id,
        productId: product.id,
        quantity,
        unitPrice,
        totalPrice,
      },
    });

    await tx.product.update({
      where: { id: product.id },
      data: { stock: { decrement: quantity } },
    });

    const addPoints = Math.floor(totalPrice / 1000);
    if (addPoints > 0) {
      await tx.user.update({
        where: { id: auth.id },
        data: { points: { increment: addPoints } },
      });
    }

    return created;
  });

  res.status(201).json({
    code: 201,
    status: "success",
    message: "order created",
    data: order,
  });
}

export async function getMyOrders(req: Request, res: Response) {
  const auth = (req as any).user as { id: number } | undefined;
  if (!auth) {
    const err = new Error("Login required");
    (err as any).status = 403;
    throw err;
  }

  const q = req.query as Record<string, any>;
  const where: any = { userId: auth.id };

  if (q.productId) where.productId = toInt(q.productId, 0) || undefined;

  if (q.minTotal || q.maxTotal) {
    where.totalPrice = {};
    if (q.minTotal) where.totalPrice.gte = toInt(q.minTotal, 0);
    if (q.maxTotal) where.totalPrice.lte = toInt(q.maxTotal, 0);
  }

  if (q.from || q.to) {
    where.createdAt = {};
    if (q.from) where.createdAt.gte = new Date(`${q.from}T00:00:00.000Z`);
    if (q.to) where.createdAt.lte = new Date(`${q.to}T23:59:59.999Z`);
  }

  const sortBy =
    (q.sortBy as "createdAt" | "totalPrice" | "quantity") ?? "createdAt";
  const order = (q.order as "asc" | "desc") ?? "desc";
  const limit = Math.min(Math.max(toInt(q.limit, 10), 1), 100);
  const offset = Math.max(toInt(q.offset, 0), 0);

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { [sortBy]: order },
      take: limit,
      skip: offset,
      include: {
        product: { select: { id: true, name: true, price: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  res.status(200).json({
    code: 200,
    status: "success",
    message: "my orders",
    meta: { total, limit, offset },
    data,
  });
}

export async function getAllOrders(req: Request, res: Response) {
  const auth = (req as any).user as { id: number; role: string } | undefined;
  if (!auth) {
    const err = new Error("Login required");
    (err as any).status = 403;
    throw err;
  }
  if (String(auth.role).toUpperCase() !== "SUPPLIER") {
    const err = new Error("Only SUPPLIER can view all orders");
    (err as any).status = 403;
    throw err;
  }

  const q = req.query as Record<string, any>;
  const where: any = {};

  if (q.userId) where.userId = toInt(q.userId, 0) || undefined;
  if (q.productId) where.productId = toInt(q.productId, 0) || undefined;

  if (q.minTotal || q.maxTotal) {
    where.totalPrice = {};
    if (q.minTotal) where.totalPrice.gte = toInt(q.minTotal, 0);
    if (q.maxTotal) where.totalPrice.lte = toInt(q.maxTotal, 0);
  }

  if (q.from || q.to) {
    where.createdAt = {};
    if (q.from) where.createdAt.gte = new Date(`${q.from}T00:00:00.000Z`);
    if (q.to) where.createdAt.lte = new Date(`${q.to}T23:59:59.999Z`);
  }

  const sortBy =
    (q.sortBy as "createdAt" | "totalPrice" | "quantity") ?? "createdAt";
  const order = (q.order as "asc" | "desc") ?? "desc";
  const limit = Math.min(Math.max(toInt(q.limit, 10), 1), 100);
  const offset = Math.max(toInt(q.offset, 0), 0);

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { [sortBy]: order },
      take: limit,
      skip: offset,
      include: {
        user: { select: { id: true, name: true, email: true, points: true } },
        product: { select: { id: true, name: true, price: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  res.status(200).json({
    code: 200,
    status: "success",
    message: "all orders",
    meta: { total, limit, offset },
    data,
  });
}

export async function getOrdersSummary(_req: Request, res: Response) {
  const groups = await prisma.order.groupBy({
    by: ["userId"],
    _count: { _all: true },
    _sum: { totalPrice: true, quantity: true },
  });

  if (groups.length === 0) {
    return res.status(200).json({
      code: 200,
      status: "success",
      message: "orders summary by user",
      data: [],
    });
  }

  const users = await prisma.user.findMany({
    where: { id: { in: groups.map((g) => g.userId) } },
    select: { id: true, name: true, email: true, points: true },
  });

  const result = groups.map((g) => {
    const u = users.find((x) => x.id === g.userId);
    return {
      user: u ?? { id: g.userId, name: "(deleted user)", email: "", points: 0 },
      ordersCount: g._count._all,
      totalQuantity: g._sum.quantity ?? 0,
      totalSpent: g._sum.totalPrice ?? 0,
    };
  });

  res.status(200).json({
    code: 200,
    status: "success",
    message: "orders summary by user",
    data: result,
  });
}
