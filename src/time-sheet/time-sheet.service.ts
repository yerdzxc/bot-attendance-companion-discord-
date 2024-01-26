import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SetTimeDto } from './dtos/set-time.dto';
import { UserService } from '../user/user.service';
import * as moment from 'moment';
import { DiscordUser, TimeSheet } from '@prisma/client';

@Injectable()
export class TimeSheetService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly userService: UserService
    ) { }

    async setTime(setTimeDto: SetTimeDto): Promise<string> {
        const validateUser = await this.userService.exists(setTimeDto.discordId);
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

    async timeIn(setTimeDto: SetTimeDto): Promise<string> {
        const timeIn = new Date();
        const signatureDate = moment(timeIn).format('YYYY-MM-DD');

        const expectedTimeOut = moment(timeIn).add(9, 'hours').toDate();

        try {
            await this.prisma.$transaction([
                this.prisma.timeSheet.create({
                    data: {
                        discordUserId: setTimeDto.discordId,
                        username: setTimeDto.username,
                        timeIn: timeIn,
                        signatureDate: signatureDate,
                        expectedTimeOut: expectedTimeOut
                    }
                }),
                this.prisma.discordUser.update({
                    where: {
                        discordId: setTimeDto.discordId,
                    },
                    data: {
                        username: setTimeDto.username,
                        lastAccess: signatureDate,
                        active: true
                    }
                })
            ]);
        } catch (err: any) {
            console.log(err.response)
            return `Attendance service is down, sorry my bad. Seek help to the server admins! <:crying_cat:123456789012345678>`;
        }

        const dateFormat = moment(timeIn).format("MMMM D, YYYY hh:mm A");
        const formattedExpectedTimeOut = moment(expectedTimeOut).format("MMMM D, YYYY hh:mm A");
        return `${setTimeDto.username}, Logged in @ ${dateFormat}. <:blue_heart:123456789012345678>, Expected logout is @ ${formattedExpectedTimeOut}. <:clock9:123456789012345678>`
    }

    async timeOut(lastRecord: TimeSheet): Promise<string> {
        const timeIn = moment(lastRecord.timeIn);
        const timeOut = new Date();

        const duration = moment.duration(moment(timeOut).diff(timeIn));
        const totalHours = duration.asHours();

        const transaction = await this.prisma.timeSheet.update({
            where: { id: lastRecord.id },
            data: {
                timeOut: timeOut,
                timeTotal: totalHours.toString(),
                visibleTotal: Math.floor(totalHours),
            }
        });
        if (!transaction) return `Attendance service is down, sorry my bad. Seek help to the server admins! <:crying_cat:123456789012345678>`
        const dateFormat = moment(timeOut).format("MMMM D, YYYY hh:mm A");
        const humanizedDuration = moment.duration(duration).humanize();
        return `${lastRecord.username}, Logged out @ ${dateFormat}. Total time: ${humanizedDuration}. <:city_dusk:123456789012345678>`
    }

    async attendance(): Promise<string> {
        const now = new Date();
        const signature = moment(now).format('YYYY-MM-DD');

        const attendance = await this.prisma.timeSheet.findMany({
            where: {
                signatureDate: signature
            },
            orderBy: {
                created_at: 'asc'
            }
        });

        return this.attendanceResult(attendance, now);
    }

    attendanceResult(attendance: TimeSheet[], now: Date): string {
        const dateToday = moment(now).format('MMMM D, YYYY');
        const day = moment(now).format('dddd');
        let motivation: string;

        switch (day) {
            case 'Monday':
                motivation = `Today is ${dateToday}.\nHappy Monday: Marvelous start to the week! <:hugging_face:123456789012345678>`;
                break;
            case 'Tuesday':
                motivation = `Today is ${dateToday}.\nGorgeous Tuesday: Embrace the beauty in every moment. <:heart_eyes:123456789012345678>`;
                break;
            case 'Wednesday':
                motivation = `Today is ${dateToday}.\nWhimsical Wednesday: Find joy in the middle of the week. <:winking_face:123456789012345678>`;
                break;
            case 'Thursday':
                motivation = `Today is ${dateToday}.\nThoughtful Thursday: Reflect on the positive moments. <:star_struck:123456789012345678>`;
                break;
            case 'Friday':
                motivation = `Today is ${dateToday}.\nFantastic Friday: Celebrate the upcoming weekend! <:partying_face:123456789012345678>`;
                break;
            case 'Saturday':
                motivation = `Today is ${dateToday}.\nSunny Saturday: Enjoy the sunshine of the weekend. <:grinning_face:123456789012345678>`;
                break;
            case 'Sunday':
                motivation = `Today is ${dateToday} \nSerene Sunday: Take a moment of calm and relaxation. Linggo ngayon ah sipag mo naman! <:exploding_head:123456789012345678>`;
                break;
        }

        if (attendance.length <= 0) return `${motivation}.\nEmployees ghosted us, no one is present! <:ghost:123456789012345678>`;

        if (attendance.length === 1) return `${motivation}.\nNot all heroes wear capes! Solo yern?\n1. ${attendance[0].username}, Logged @ ${moment(attendance[0].timeIn).format("hh:mm A")} - Expected logout @ ${moment(attendance[0].expectedTimeOut).format("hh:mm A")} <:superhero:123456789012345678>`;

        if (attendance.length > 1) {
            let result = `${motivation}\n`;
            attendance.forEach((item, index) => {
                const timeIn = moment(item.timeIn).format("hh:mm A");
                const expectedTimeOut = item.expectedTimeOut ? moment(item.expectedTimeOut).format("hh:mm A") : item.signatureDate;
                if (index === 0) {
                    result += `${index + 1}. ${item.username}, Logged @ ${timeIn} - Expected logout @ ${expectedTimeOut} <:saluting_face:123456789012345678>\n`;
                } else if (index === attendance.length - 1) {
                    result += `${index + 1}. ${item.username}, Logged @ ${timeIn} - Expected logout @ ${expectedTimeOut} <:sunglasses:123456789012345678>\n`;
                } else {
                    result += `${index + 1}. ${item.username}, Logged @ ${timeIn} - Expected logout @ ${expectedTimeOut} <:hugging_face:123456789012345678>`;
                }
            });
            return result;
        }
    }

    async absent(): Promise<string> {
        const now = new Date();
        const signature = moment(now).format('YYYY-MM-DD');

        const [users, actives] = await this.prisma.$transaction([
            this.prisma.discordUser.findMany({
                where: {
                    active: true
                }
            }),
            this.prisma.timeSheet.findMany({
                where: {
                    signatureDate: signature
                }
            })
        ]);

        const absents = users.filter(user => !actives.some(active => active.discordUserId === user.discordId));

        return this.absentResult(absents, now);
    }

    absentResult(absents: DiscordUser[], now: Date): string {
        const dateToday = moment(now).format('MMMM D, YYYY');
        const day = moment(now).format('dddd');
        let motivation: string;

        switch (day) {
            case 'Monday':
                motivation = `Today is ${dateToday}.\nHappy Monday: Marvelous start to the week! <:hugging_face:123456789012345678>`;
                break;
            case 'Tuesday':
                motivation = `Today is ${dateToday}.\nGorgeous Tuesday: Embrace the beauty in every moment. <:heart_eyes:123456789012345678>`;
                break;
            case 'Wednesday':
                motivation = `Today is ${dateToday}.\nWhimsical Wednesday: Find joy in the middle of the week. <:winking_face:123456789012345678>`;
                break;
            case 'Thursday':
                motivation = `Today is ${dateToday}.\nThoughtful Thursday: Reflect on the positive moments. <:star_struck:123456789012345678>`;
                break;
            case 'Friday':
                motivation = `Today is ${dateToday}.\nFantastic Friday: Celebrate the upcoming weekend! <:partying_face:123456789012345678>`;
                break;
            case 'Saturday':
                motivation = `Today is ${dateToday}.\nSunny Saturday: Enjoy the sunshine of the weekend. <:grinning_face:123456789012345678>`;
                break;
            case 'Sunday':
                motivation = `Today is ${dateToday} \nSerene Sunday: Take a moment of calm and relaxation. Linggo ngayon ah sipag mo naman! <:exploding_head:123456789012345678>`;
                break;
        }
        if (absents.length <= 0) return `${motivation}.\nAll Employees are here, everyone is present! <:star_struck:123456789012345678>`;

        if (absents.length >= 1) {
            let result = `${motivation}\nAbsent(s) List. <:ghost:123456789012345678>\n`;
            absents.forEach((item, index) => {
                result += `${index + 1}. ${item.username}\n`;
            });
            return result;
        }
    }
}
