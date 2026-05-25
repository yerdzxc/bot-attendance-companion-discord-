-- AlterTable: add recurring column to Holiday
ALTER TABLE "Holiday" ADD COLUMN "recurring" BOOLEAN NOT NULL DEFAULT false;
