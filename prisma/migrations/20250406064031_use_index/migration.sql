-- CreateIndex
CREATE INDEX "DiscordUser_active_idx" ON "DiscordUser"("active");

-- CreateIndex
CREATE INDEX "DiscordUser_type_idx" ON "DiscordUser"("type");

-- CreateIndex
CREATE INDEX "DiscordUser_type_active_idx" ON "DiscordUser"("type", "active");

-- CreateIndex
CREATE INDEX "TimeSheet_discordUserId_idx" ON "TimeSheet"("discordUserId");

-- CreateIndex
CREATE INDEX "TimeSheet_discordUserId_signatureDate_idx" ON "TimeSheet"("discordUserId", "signatureDate");
