-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('employee', 'intern');

-- AlterTable
ALTER TABLE "DiscordUser" ADD COLUMN     "type" "UserType" NOT NULL DEFAULT 'employee';
