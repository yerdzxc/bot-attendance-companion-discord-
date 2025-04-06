import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
