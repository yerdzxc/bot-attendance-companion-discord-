import { Inject, Injectable } from '@nestjs/common';
import { DrizzleService } from '@app/common/types/drizzle';
import { DRIZZLE } from '@app/common/drizzle/drizzle.module';
import { eq, and, gte, lte, SQL } from 'drizzle-orm';
import { Holiday } from '@app/common/drizzle/schema';

@Injectable()
export class HolidayService {
  constructor(@Inject(DRIZZLE) private db: DrizzleService) {}

  async list() {
    return this.db.query.Holiday.findMany({
      where: eq(Holiday.deleted, false),
      orderBy: (h, { asc }) => [asc(h.date)],
    });
  }

  async listAll() {
    return this.db.query.Holiday.findMany({ orderBy: (h, { asc }) => [asc(h.date)] });
  }

  async listInRange(from: string, to: string) {
    const fixed = await this.db
      .select()
      .from(Holiday)
      .where(and(eq(Holiday.deleted, false), eq(Holiday.recurring, false), gte(Holiday.date, from), lte(Holiday.date, to)));

    const recurring = await this.db
      .select()
      .from(Holiday)
      .where(and(eq(Holiday.deleted, false), eq(Holiday.recurring, true)));

    const fromYear = parseInt(from.slice(0, 4), 10);
    const toYear = parseInt(to.slice(0, 4), 10);

    for (const h of recurring) {
      const mmdd = h.date.slice(5);
      for (let y = fromYear; y <= toYear; y++) {
        const date = `${y}-${mmdd}`;
        if (date >= from && date <= to) {
          fixed.push({ ...h, date });
        }
      }
    }

    fixed.sort((a, b) => a.date.localeCompare(b.date));
    return fixed;
  }

  async upsert(date: string, name: string, recurring = false) {
    await this.db
      .insert(Holiday)
      .values({ date, name, recurring, deleted: false })
      .onConflictDoUpdate({
        target: [Holiday.date],
        set: { name, recurring, deleted: false },
      });
    return 'Holiday saved.';
  }

  async remove(date: string) {
    await this.db
      .update(Holiday)
      .set({ deleted: true })
      .where(eq(Holiday.date, date));
    return 'Holiday removed.';
  }

  async restore(date: string) {
    await this.db
      .update(Holiday)
      .set({ deleted: false })
      .where(eq(Holiday.date, date));
    return 'Holiday restored.';
  }
}
