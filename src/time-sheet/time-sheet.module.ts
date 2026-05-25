import { Module } from '@nestjs/common';
import { TimeSheetService } from './time-sheet.service';
import { UserModule } from '@app/user/user.module';
import { DrizzleModule } from '@app/common/drizzle/drizzle.module';
import { HolidayService } from '@app/holiday/holiday.service';

@Module({
  imports: [DrizzleModule, UserModule],
  providers: [TimeSheetService, HolidayService],
  exports: [TimeSheetService],
})
export class TimeSheetModule {}
