import { Inject, Injectable } from '@nestjs/common';
import { DrizzleService } from '@app/common/types/drizzle';
import { DRIZZLE } from '@app/common/drizzle/drizzle.module';
import { OvertimeRequest } from '@app/common/drizzle/schema';
import { eq, and, gte, lte, SQL, desc } from 'drizzle-orm';

@Injectable()
export class OvertimeRequestService {
  constructor(@Inject(DRIZZLE) private db: DrizzleService) {}

  async create(discordUserId: string, date: string, hours: number, type: 'pre' | 'post', note?: string) {
    await this.db.insert(OvertimeRequest).values({
      discordUserId,
      date,
      hours,
      type,
      note,
    });
    return 'Overtime request filed.';
  }

  async list(from?: string, to?: string, status?: string) {
    const filters: SQL[] = [];
    if (from) filters.push(gte(OvertimeRequest.date, from));
    if (to) filters.push(lte(OvertimeRequest.date, to));
    if (status) filters.push(eq(OvertimeRequest.status, status as any));
    return this.db
      .select()
      .from(OvertimeRequest)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(OvertimeRequest.created_at));
  }

  async approve(id: number, note?: string) {
    await this.db
      .update(OvertimeRequest)
      .set({ status: 'approved' as any, note, updated_at: new Date() })
      .where(eq(OvertimeRequest.id, id));
    return 'Overtime approved.';
  }

  async reject(id: number, note?: string) {
    await this.db
      .update(OvertimeRequest)
      .set({ status: 'rejected' as any, note, updated_at: new Date() })
      .where(eq(OvertimeRequest.id, id));
    return 'Overtime rejected.';
  }
}
