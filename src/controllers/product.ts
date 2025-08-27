import { Request, Response } from "express";
import { prisma } from "../connections/client";

const badRequest = (m: string) => Object.assign(new Error(m), { status: 400 });
const notFound = (m = "Product not found") =>
  Object.assign(new Error(m), { status: 404 });

const notDeleted = (flag?: string) =>
  flag === "true" ? {} : { deletedAt: null };

export const getProducts = async (req: Request, res: Response) => {
  const {
    q,
    minPrice,
    maxPrice,
    sortBy = "id",
    order = "asc",
    limit = "10",
    offset = "0",
    includeDeleted,
  } = req.query as Record<string, string | undefined>;

  const where: any = { ...notDeleted(includeDeleted) };
  if (q?.trim()) where.OR = [{ name: { contains: q, mode: "insensitive" } }];
  if (minPrice) (where.price ??= {}).gte = Number(minPrice);
  if (maxPrice) (where.price ??= {}).lte = Number(maxPrice);

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { [String(sortBy)]: order === "desc" ? "desc" : "asc" },
      take: Number(limit),
      skip: Number(offset),
    }),
    prisma.product.count({ where }),
  ]);

  res.status(200).json({
    code: 200,
    status: "success",
    message: "Products fetched successfully!",
    data,
    meta: { total, limit: Number(limit), offset: Number(offset) },
  });
};

export const getProduct = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw badRequest("Invalid ID");

  const product = await prisma.product.findFirst({
    where: { id, deletedAt: null },
  });
  if (!product) throw notFound();

  res.status(200).json({
    code: 200,
    status: "success",
    message: "Product fetched successfully!",
    data: product,
  });
};

export const createProduct = async (req: Request, res: Response) => {
  const user = req.user!;
  const { name, description, price, stock, imageUrl } = req.body;

  const product = await prisma.product.create({
    data: {
      name,
      description: description ?? null,
      price,
      stock,
      imageUrl: imageUrl ?? null,
      supplierId: user.id,
      deletedAt: null,
    },
  });

  res.status(201).json({
    code: 201,
    status: "success",
    message: "Product created successfully!",
    data: product,
  });
};

export const updateProduct = async (req: Request, res: Response) => {
  const user = req.user!;
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw badRequest("Invalid ID");

  const found = await prisma.product.findFirst({
    where: { id, supplierId: user.id, deletedAt: null },
  });
  if (!found) throw notFound();

  const { name, description, price, stock, imageUrl } = req.body;

  const product = await prisma.product.update({
    where: { id: found.id },
    data: {
      name,
      description: description ?? undefined,
      price,
      stock,
      imageUrl: imageUrl ?? undefined,
    },
  });

  res.status(200).json({
    code: 200,
    status: "success",
    message: "Product updated successfully!",
    data: product,
  });
};

export const deleteProduct = async (req: Request, res: Response) => {
  const user = req.user!;
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw badRequest("Invalid ID");

  const found = await prisma.product.findFirst({
    where: { id, supplierId: user.id, deletedAt: null },
  });
  if (!found) throw notFound();

  const product = await prisma.product.update({
    where: { id: found.id },
    data: { deletedAt: new Date() },
  });

  res.status(200).json({
    code: 200,
    status: "success",
    message: "Product soft-deleted successfully!",
    data: product,
  });
};

export const restoreProduct = async (req: Request, res: Response) => {
  const user = req.user!;
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw badRequest("Invalid ID");

  const found = await prisma.product.findFirst({
    where: { id, supplierId: user.id, deletedAt: { not: null } },
  });
  if (!found) throw notFound("Product not found or not soft-deleted");

  const product = await prisma.product.update({
    where: { id: found.id },
    data: { deletedAt: null },
  });

  res.status(200).json({
    code: 200,
    status: "success",
    message: "Product restored succesfully!",
    data: product,
  });
};
