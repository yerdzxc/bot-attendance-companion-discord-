import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { TimeSheetModule } from '@app/time-sheet/time-sheet.module';
import { UserModule } from '@app/user/user.module';

@Module({
  imports: [TimeSheetModule, UserModule],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
