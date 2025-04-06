import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { DiscordUserDto } from './user/dtos/discord-user.dto';
import { UserService } from './user/user.service';
import { SetTimeDto } from './time-sheet/dtos/set-time.dto';
import { TimeSheetService } from './time-sheet/time-sheet.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('APP')
@Controller('api')
export class AppController {
  constructor(
    private readonly userService: UserService,
    private readonly timeSheetService: TimeSheetService,
  ) {}

  @Get('test')
  async test(): Promise<boolean> {
    return await this.userService.exists('123456789012345678');
  }

  @Post('bind')
  async bindUser(@Body() body: DiscordUserDto): Promise<string | undefined> {
    return await this.userService.setBind(body);
  }

  @Post('set-time')
  async setTime(@Body() body: SetTimeDto): Promise<string> {
    return await this.timeSheetService.setTime(body);
  }

  @Get('attendance')
  async attendance(): Promise<string> {
    return await this.timeSheetService.attendance('employee');
  }

  @Get('attendance-by-date')
  @ApiQuery({
    name: 'signature',
    description: 'YYYY-MM-DD',
    example: '2025-04-06',
    required: true,
  })
  async attendanceByDate(
    @Query('signature') signature: string,
  ): Promise<string> {
    return await this.timeSheetService.attendanceByDate(signature);
  }

  @Get('attendance-intern')
  async attendanceIntern(): Promise<string> {
    return await this.timeSheetService.attendance('intern');
  }

  @Get('absent')
  async absent() {
    return await this.timeSheetService.absent('employee');
  }

  @Get('absent-by-date')
  @ApiQuery({
    name: 'signature',
    description: 'YYYY-MM-DD',
    example: '2025-04-06',
    required: true,
  })
  async absentByDate(@Query('signature') signature: string): Promise<string> {
    return await this.timeSheetService.absentByDate(signature);
  }

  @Get('absent-intern')
  async absentIntern() {
    return await this.timeSheetService.absent('intern');
  }
}
