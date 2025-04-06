import { Module } from '@nestjs/common';
import { TimeSheetService } from './time-sheet.service';
import { UserModule } from '@app/user/user.module';
import { DrizzleModule } from '@app/common/drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule, UserModule],
  providers: [TimeSheetService],
  exports: [TimeSheetService],
})
export class TimeSheetModule {}
