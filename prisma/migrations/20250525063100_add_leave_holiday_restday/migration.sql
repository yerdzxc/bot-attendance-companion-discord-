-- AlterEnum
CREATE TYPE "LeaveType" AS ENUM ('SL', 'VL', 'EL', 'BDL', 'OB');

-- AlterTable
ALTER TABLE "DiscordUser" ADD COLUMN "restDay" TEXT;

-- CreateTable
CREATE TABLE "Leave" (
    "id" SERIAL NOT NULL,
    "discordUserId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "type" "LeaveType" NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Leave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Holiday" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Holiday_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Leave_discordUserId_date_key" ON "Leave"("discordUserId", "date");

-- CreateIndex
CREATE INDEX "Leave_discordUserId_idx" ON "Leave"("discordUserId");

-- CreateIndex
CREATE INDEX "Leave_date_idx" ON "Leave"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Holiday_date_key" ON "Holiday"("date");

-- CreateIndex
CREATE INDEX "Holiday_date_idx" ON "Holiday"("date");

-- AddForeignKey
ALTER TABLE "Leave" ADD CONSTRAINT "Leave_discordUserId_fkey" FOREIGN KEY ("discordUserId") REFERENCES "DiscordUser"("discordId") ON DELETE RESTRICT ON UPDATE CASCADE;
