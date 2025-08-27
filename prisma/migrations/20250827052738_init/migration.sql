/*
  Warnings:

  - You are about to drop the column `desciption` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "desciption",
ADD COLUMN     "description" TEXT;
