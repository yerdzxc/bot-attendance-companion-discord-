import { Inject, Injectable } from '@nestjs/common';
import { DrizzleService } from '@app/common/types/drizzle';
import { DRIZZLE } from '@app/common/drizzle/drizzle.module';
import { eq, and, gte, lte, SQL } from 'drizzle-orm';
import { Leave } from '@app/common/drizzle/schema';

@Injectable()
export class LeaveService {
  constructor(@Inject(DRIZZLE) private db: DrizzleService) {}

  async list(dateFrom?: string, dateTo?: string) {
    const filters: SQL[] = [];
    if (dateFrom) filters.push(gte(Leave.date, dateFrom));
    if (dateTo) filters.push(lte(Leave.date, dateTo));
    return this.db.query.Leave.findMany({
      where: filters.length ? and(...filters) : undefined,
      with: { discordUser: true },
    });
  }

  async upsert(discordUserId: string, date: string, type: string, note?: string) {
    await this.db
      .insert(Leave)
      .values({ discordUserId, date, type: type as any, note })
      .onConflictDoUpdate({
        target: [Leave.discordUserId, Leave.date],
        set: { type: type as any, note, updated_at: new Date() },
      });
    return 'Leave updated.';
  }

  async remove(discordUserId: string, date: string) {
    await this.db
      .delete(Leave)
      .where(and(eq(Leave.discordUserId, discordUserId), eq(Leave.date, date)));
    return 'Leave removed.';
  }
}
