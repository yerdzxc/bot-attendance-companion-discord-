/*
  Warnings:

  - You are about to drop the column `status` on the `TimeSheet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TimeSheet" DROP COLUMN "status",
ADD COLUMN     "signatureDate" TEXT;
