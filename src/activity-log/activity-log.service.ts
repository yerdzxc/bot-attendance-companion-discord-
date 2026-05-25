import { Inject, Injectable } from '@nestjs/common';
import { DrizzleService } from '@app/common/types/drizzle';
import { DRIZZLE } from '@app/common/drizzle/drizzle.module';
import { ActivityLog } from '@app/common/drizzle/schema';
import { desc } from 'drizzle-orm';

@Injectable()
export class ActivityLogService {
  constructor(@Inject(DRIZZLE) private db: DrizzleService) {}

  async log(action: string, targetId?: string, detail?: string) {
    await this.db.insert(ActivityLog).values({ action, targetId, detail });
  }

  async list(limit = 100) {
    return this.db
      .select()
      .from(ActivityLog)
      .orderBy(desc(ActivityLog.created_at))
      .limit(limit);
  }
}
