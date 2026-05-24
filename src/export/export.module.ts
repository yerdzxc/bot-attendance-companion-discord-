import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { TimeSheetModule } from '@app/time-sheet/time-sheet.module';
import { UserModule } from '@app/user/user.module';
import { DrizzleModule } from '@app/common/drizzle/drizzle.module';
import { HolidayService } from '@app/holiday/holiday.service';
import { LeaveService } from '@app/leave/leave.service';

@Module({
  imports: [TimeSheetModule, UserModule, DrizzleModule],
  controllers: [ExportController],
  providers: [ExportService, HolidayService, LeaveService],
})
export class ExportModule {}
