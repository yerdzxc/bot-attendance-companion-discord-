import { Body, Controller, Post } from '@nestjs/common';
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
  async bindUser(@Body() body: DiscordUserDto) {
    return await this.userService.bindUser(body);
  }

  @Post('set-time')
  async setTime(@Body() body: SetTimeDto) {
    return await this.timeSheetService.setTime(body);
  }
}
