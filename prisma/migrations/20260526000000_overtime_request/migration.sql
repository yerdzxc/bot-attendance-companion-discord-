-- CreateEnum
CREATE TYPE "OvertimeType" AS ENUM ('pre', 'post', 'rd', 'holiday');
CREATE TYPE "OvertimeStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "OvertimeRequest" (
    "id" SERIAL NOT NULL,
    "discordUserId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "type" "OvertimeType" NOT NULL,
    "status" "OvertimeStatus" NOT NULL DEFAULT 'pending',
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "OvertimeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OvertimeRequest_discordUserId_idx" ON "OvertimeRequest"("discordUserId");
CREATE INDEX "OvertimeRequest_date_idx" ON "OvertimeRequest"("date");
CREATE INDEX "OvertimeRequest_status_idx" ON "OvertimeRequest"("status");
