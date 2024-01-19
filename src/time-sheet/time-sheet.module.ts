import { Module } from '@nestjs/common';
import { TimeSheetService } from './time-sheet.service';
import { PrismaService } from '../prisma.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [TimeSheetService, PrismaService],
  exports: [TimeSheetService]
})
export class TimeSheetModule { }
