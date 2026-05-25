import { Module } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { DrizzleModule } from '@app/common/drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  providers: [ActivityLogService],
  exports: [ActivityLogService],
})
export class ActivityLogModule {}
