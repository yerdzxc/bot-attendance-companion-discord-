-- DropIndex
DROP INDEX "TimeSheet_discordUserId_signatureDate_idx";

-- CreateIndex
CREATE INDEX "TimeSheet_signatureDate_idx" ON "TimeSheet"("signatureDate");
