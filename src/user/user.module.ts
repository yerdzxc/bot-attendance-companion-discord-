import { Module } from '@nestjs/common';
import { DrizzleModule } from '@app/common/drizzle/drizzle.module';
import { UserService } from './user.service';
import { ActivityLogModule } from '@app/activity-log/activity-log.module';

@Module({
  imports: [DrizzleModule, ActivityLogModule],
  providers: [UserService],
  controllers: [],
  exports: [UserService],
})
export class UserModule {}
