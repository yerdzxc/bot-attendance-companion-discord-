import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TimeSheetModule } from './time-sheet/time-sheet.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { DrizzleModule } from './common/drizzle/drizzle.module';
import { ConfigModule } from '@nestjs/config';
import { ExportModule } from './export/export.module';
import { OvertimeRequestService } from './overtime-request/overtime-request.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    UserModule,
    TimeSheetModule,
    SchedulerModule,
    DrizzleModule,
    ExportModule,
  ],
  controllers: [AppController],
  providers: [AppService, OvertimeRequestService],
})
export class AppModule {}
