import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SetTimeDto } from './dtos/set-time.dto';
import { UserService } from '../user/user.service';
import * as moment from 'moment';
import { TimeSheet } from '@prisma/client';

@Injectable()
export class TimeSheetService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly userService: UserService
    ) { }

    async setTime(setTimeDto: SetTimeDto) {
        const validateUser = this.userService.exists(setTimeDto.discordId);
        if (!validateUser) return `Account must be binded. Run '/bind' command or seek help to the server admins. <:woman_gesturing_no:123456789012345678>`;

        const lastRecord = await this.prisma.timeSheet.findFirst({
            where: {
                discordUserId: setTimeDto.discordId,
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        const command = setTimeDto.command;
        switch (command) {
            case 'time-in':
                if (!lastRecord) {
                    return await this.timeIn(setTimeDto);
                }
                return !lastRecord.timeOut ? `You have an existing session. Run '/time-out' command to re-initialized timestamps!. <:woman_facepalming:123456789012345678>` : await this.timeIn(setTimeDto);
            case 'time-out':
                if (!lastRecord) {
                    return `Run '/time-in' command to initialized timestamps <:woman_facepalming:123456789012345678>`;
                }
                return lastRecord.timeOut ? `You're already logged out. Run '/time-in' to initialize timestamps!. <:woman_facepalming:123456789012345678>` : this.timeOut(lastRecord);
        }
    }

    async timeIn(setTimeDto: SetTimeDto) {
        const timeIn = new Date()
        const transaction = await this.prisma.timeSheet.create({
            data: {
                discordUserId: setTimeDto.discordId,
                username: setTimeDto.username,
                timeIn: timeIn
            }
        });
        if (!transaction) return `Attendance service is down, sorry my bad. Seek help to the server admins! <:crying_cat:123456789012345678>`
        const dateFormat = moment(timeIn).format("MMMM D, YYYY hh:mm A");
        return `${setTimeDto.username}, Logged in @ ${dateFormat}. <:blue_heart:123456789012345678>`
    }

    async timeOut(lastRecord: TimeSheet) {
        const timeIn = moment(lastRecord.timeIn);
        const timeOut = new Date();

        const duration = moment.duration(moment(timeOut).diff(timeIn));
        const totalHours = duration.asHours();

        console.log(totalHours)
        const transaction = await this.prisma.timeSheet.update({
            where: { id: lastRecord.id },
            data: {
                timeOut: timeOut,
                timeTotal: totalHours.toString(),
                visibleTotal: Math.floor(totalHours),
                status: 'sycn'
            }
        });
        if (!transaction) return `Attendance service is down, sorry my bad. Seek help to the server admins! <:crying_cat:123456789012345678>`
        const dateFormat = moment(timeOut).format("MMMM D, YYYY hh:mm A");
        const humanizedDuration = moment.duration(duration).humanize();
        return `${lastRecord.username}, Logged out @ ${dateFormat}. Total time: ${humanizedDuration}. <:city_dusk:123456789012345678>`
    }
}
