import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TimeSheetModule } from './time-sheet/time-sheet.module';

@Module({
  imports: [UserModule, TimeSheetModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
