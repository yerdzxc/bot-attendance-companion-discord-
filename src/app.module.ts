import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TimeSheetModule } from './time-sheet/time-sheet.module';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    UserModule,
    TimeSheetModule,
    SchedulerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
