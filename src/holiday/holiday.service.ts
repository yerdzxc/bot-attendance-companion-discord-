import { Inject, Injectable } from '@nestjs/common';
import { DrizzleService } from '@app/common/types/drizzle';
import { DRIZZLE } from '@app/common/drizzle/drizzle.module';
import { eq } from 'drizzle-orm';
import { Holiday } from '@app/common/drizzle/schema';

@Injectable()
export class HolidayService {
  constructor(@Inject(DRIZZLE) private db: DrizzleService) {}

  async list() {
    return this.db.query.Holiday.findMany({ orderBy: (h, { asc }) => [asc(h.date)] });
  }

  async upsert(date: string, name: string) {
    await this.db
      .insert(Holiday)
      .values({ date, name })
      .onConflictDoUpdate({
        target: [Holiday.date],
        set: { name },
      });
    return 'Holiday saved.';
  }

  async remove(date: string) {
    await this.db.delete(Holiday).where(eq(Holiday.date, date));
    return 'Holiday removed.';
  }
}
