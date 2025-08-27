import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function main() {
  const supplierPass = await hashPassword("supplier123");
  const userPass = await hashPassword("user12345");

  await prisma.user.upsert({
    where: { email: "supplier@example.com" },
    update: {},
    create: {
      name: "Supplier",
      email: "supplier@example.com",
      password: supplierPass,
      role: "SUPPLIER",
    },
  });

  await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      name: "User",
      email: "user@example.com",
      password: userPass,
      role: "USER",
    },
  });

  await prisma.product.createMany({
    data: [
      { name: "T-Shirt", description: "Cotton tee", price: 120000, stock: 20 },
      { name: "Mug", description: "Ceramic mug", price: 80000, stock: 50 },
      { name: "Cap", description: "Black cap", price: 95000, stock: 15 },
    ],
    skipDuplicates: true,
  });
}
