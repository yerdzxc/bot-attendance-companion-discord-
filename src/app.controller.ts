import { Body, Controller, Get, Post } from '@nestjs/common';
import { DiscordUserDto } from './user/dtos/discord-user.dto';
import { UserService } from './user/user.service';
import { SetTimeDto } from './time-sheet/dtos/set-time.dto';
import { TimeSheetService } from './time-sheet/time-sheet.service';

@Controller('api')
export class AppController {
  constructor(
    private readonly userService: UserService,
    private readonly timeSheetService: TimeSheetService
  ) { }

  @Post('bind')
  async bindUser(@Body() body: DiscordUserDto): Promise<string> {
    return await this.userService.bindUser(body);
  }

  @Post('set-time')
  async setTime(@Body() body: SetTimeDto): Promise<string> {
    return await this.timeSheetService.setTime(body);
  }

  @Get('attendance')
  async attendance(): Promise<string> {
    const result = await this.timeSheetService.attendance();
    console.log(result);
    return result;
  }

  @Get('absent')
  async absent() {
    return await this.timeSheetService.absent();
  }
}