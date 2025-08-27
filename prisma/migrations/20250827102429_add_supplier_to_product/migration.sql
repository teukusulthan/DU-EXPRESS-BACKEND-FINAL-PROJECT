/*
  Warnings:

  - Added the required column `supplierId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "supplierId" INTEGER NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Product_supplierId_idx" ON "public"."Product"("supplierId");

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
