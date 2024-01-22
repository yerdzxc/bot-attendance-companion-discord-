import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UserService } from '../user/user.service';

@Injectable()
export class SchedulerService {
    private readonly logger = new Logger(SchedulerService.name);

    constructor(private readonly userService: UserService) { }

    //midnight
    @Cron('0 0 * * * *')
    handleCron() {
        this.logger.debug('Active User checker running!');
        this.userService.inactiveUser();
    }
    //10 secs
    // @Cron('10 * * * * *')
}
