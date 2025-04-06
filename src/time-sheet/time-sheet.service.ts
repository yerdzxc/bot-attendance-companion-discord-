import { Inject, Injectable } from '@nestjs/common';
import { SetTimeDto } from './dtos/set-time.dto';
import { UserService } from '@app/user/user.service';
import * as moment from 'moment';
import { DrizzleService } from '@app/common/types/drizzle';
import { DRIZZLE } from '@app/common/drizzle/drizzle.module';
import { and, desc, eq } from 'drizzle-orm';
import { DiscordUser, TimeSheet } from '@app/common/drizzle/schema';
import {
  DiscordUserModel,
  TimeSheetModel,
  TimeSheetSelect,
} from '@app/common/types/model-type';

@Injectable()
export class TimeSheetService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleService,
    private readonly userService: UserService,
  ) {}

  async setTime(setTimeDto: SetTimeDto): Promise<string> {
    const validateUser = await this.userService.exists(setTimeDto.discordId);
    if (!validateUser)
      return `Account must be binded. Run '/bind' command or seek help to the server admins. <:woman_gesturing_no:123456789012345678>`;
    const lastRecord = await this.db.query.TimeSheet.findFirst({
      where: eq(TimeSheet.discordUserId, setTimeDto.discordId),
      orderBy: (ts) => [desc(ts.created_at)],
    });

    const command = setTimeDto.command;
    switch (command) {
      case 'time-in':
        if (!lastRecord) {
          return await this.timeIn(setTimeDto);
        }
        return !lastRecord.timeOut
          ? `You have an existing session. Run '/time-out' command to re-initialized timestamps!. <:woman_facepalming:123456789012345678>`
          : await this.timeIn(setTimeDto);
      case 'time-out':
        if (!lastRecord) {
          return `Run '/time-in' command to initialized timestamps <:woman_facepalming:123456789012345678>`;
        }
        return lastRecord.timeOut
          ? `You're already logged out. Run '/time-in' to initialize timestamps!. <:woman_facepalming:123456789012345678>`
          : this.timeOut(lastRecord);
    }
    return 'Invalid Command <:woman_facepalming:123456789012345678>';
  }

  async timeIn(setTimeDto: SetTimeDto): Promise<string> {
    const timeIn = new Date();
    const signatureDate = moment(timeIn).format('YYYY-MM-DD');
    const expectedTimeOut = moment(timeIn).add(9, 'hours').toDate();

    try {
      await this.db.transaction(async (tx) => {
        await tx.insert(TimeSheet).values({
          discordUserId: setTimeDto.discordId,
          username: setTimeDto.username,
          timeIn: timeIn,
          signatureDate: signatureDate,
          expectedTimeOut: expectedTimeOut,
        });
        await tx
          .update(DiscordUser)
          .set({
            username: setTimeDto.username,
            lastAccess: signatureDate,
            active: true,
            updated_at: new Date(),
          })
          .where(eq(DiscordUser.discordId, setTimeDto.discordId));
      });
    } catch (err: any) {
      console.log(err?.response || err);
      return `Attendance service is down, sorry my bad. Seek help to the server admins! <:crying_cat:123456789012345678>`;
    }

    const dateFormat = moment(timeIn).format('MMMM D, YYYY HH:mm');
    const formattedExpectedTimeOut =
      moment(expectedTimeOut).format('MMMM D, YYYY HH:mm');
    return `${setTimeDto.username}, Logged in @ ${dateFormat}. <:blue_heart:123456789012345678>, Expected logout is @ ${formattedExpectedTimeOut}. <:clock9:123456789012345678>`;
  }

  async timeOut(lastRecord: TimeSheetModel): Promise<string> {
    const timeIn = moment(lastRecord.timeIn);
    const timeOut = new Date();
    const duration = moment.duration(moment(timeOut).diff(timeIn));
    const totalHours = duration.asHours();

    const transaction = await this.db
      .update(TimeSheet)
      .set({
        timeOut: timeOut,
        timeTotal: totalHours.toString(),
        visibleTotal: Math.floor(totalHours),
        updated_at: new Date(),
      })
      .where(eq(TimeSheet.id, lastRecord.id))
      .returning();

    if (!transaction)
      return `Attendance service is down, sorry my bad. Seek help to the server admins! <:crying_cat:123456789012345678>`;
    const dateFormat = moment(timeOut).format('MMMM D, YYYY HH:mm');
    const humanizedDuration = moment.duration(duration).humanize();
    return `${lastRecord.username}, Logged out @ ${dateFormat}. Total time: ${humanizedDuration}. <:city_dusk:123456789012345678>`;
  }

  async attendance(type: 'employee' | 'intern'): Promise<string> {
    const now = new Date();
    const signature = moment(now).format('YYYY-MM-DD');

    const attendance = await this.db
      .select({
        username: TimeSheet.username,
        timeIn: TimeSheet.timeIn,
        timeOut: TimeSheet.timeOut,
        timeTotal: TimeSheet.timeTotal,
        visibleTotal: TimeSheet.visibleTotal,
        expectedTimeOut: TimeSheet.expectedTimeOut,
        type: DiscordUser.type,
      })
      .from(TimeSheet)
      .leftJoin(DiscordUser, eq(TimeSheet.discordUserId, DiscordUser.discordId))
      .where(
        and(eq(TimeSheet.signatureDate, signature), eq(DiscordUser.type, type)),
      );
    return this.attendanceResult(attendance, now);
  }

  async attendanceByDate(signatureDate: string) {
    const date = new Date(signatureDate);

    const attendance = await this.db
      .select({
        username: TimeSheet.username,
        timeIn: TimeSheet.timeIn,
        timeOut: TimeSheet.timeOut,
        timeTotal: TimeSheet.timeTotal,
        visibleTotal: TimeSheet.visibleTotal,
        expectedTimeOut: TimeSheet.expectedTimeOut,
        type: DiscordUser.type,
      })
      .from(TimeSheet)
      .leftJoin(DiscordUser, eq(TimeSheet.discordUserId, DiscordUser.discordId))
      .where(
        and(
          eq(TimeSheet.signatureDate, signatureDate),
          eq(DiscordUser.type, 'employee'),
        ),
      );

    return this.attendanceResult(attendance, date);
  }

  async absent(type: 'employee' | 'intern'): Promise<string> {
    const now = new Date();
    const signature = moment(now).format('YYYY-MM-DD');

    const [users, actives] = await this.db.transaction(async (tx) => {
      const users = await tx
        .select()
        .from(DiscordUser)
        .where(and(eq(DiscordUser.active, true), eq(DiscordUser.type, type)));

      const actives = await tx
        .select({
          discordUserId: TimeSheet.discordUserId,
        })
        .from(TimeSheet)
        .leftJoin(
          DiscordUser,
          eq(TimeSheet.discordUserId, DiscordUser.discordId),
        )
        .where(
          and(
            eq(TimeSheet.signatureDate, signature),
            eq(DiscordUser.type, type),
          ),
        );

      return [users, actives];
    });

    const absents = users.filter(
      (user) =>
        !actives.some((active) => active.discordUserId === user.discordId),
    );

    return this.absentResult(absents, now);
  }

  async absentByDate(signatureDate: string) {
    const date = new Date(signatureDate);

    const [users, actives] = await this.db.transaction(async (tx) => {
      const users = await tx
        .select()
        .from(DiscordUser)
        .where(
          and(eq(DiscordUser.active, true), eq(DiscordUser.type, 'employee')),
        );

      const actives = await tx
        .select({
          discordUserId: TimeSheet.discordUserId,
        })
        .from(TimeSheet)
        .leftJoin(
          DiscordUser,
          eq(TimeSheet.discordUserId, DiscordUser.discordId),
        )
        .where(
          and(
            eq(TimeSheet.signatureDate, signatureDate),
            eq(DiscordUser.type, 'employee'),
          ),
        );

      return [users, actives];
    });

    const absents = users.filter(
      (user) =>
        !actives.some((active) => active.discordUserId === user.discordId),
    );

    return this.absentResult(absents, date);
  }

  private attendanceResult(attendance: TimeSheetSelect[], now: Date): string {
    const date = moment(now).format('MMMM D, YYYY');
    const day = moment(now).format('dddd');
    let motivation: string;

    switch (day) {
      case 'Monday':
        motivation = `${date}.\nHappy Monday: Marvelous start to the week! <:hugging_face:123456789012345678>`;
        break;
      case 'Tuesday':
        motivation = `${date}.\nGorgeous Tuesday: Embrace the beauty in every moment. <:heart_eyes:123456789012345678>`;
        break;
      case 'Wednesday':
        motivation = `${date}.\nWhimsical Wednesday: Find joy in the middle of the week. <:winking_face:123456789012345678>`;
        break;
      case 'Thursday':
        motivation = `${date}.\nThoughtful Thursday: Reflect on the positive moments. <:star_struck:123456789012345678>`;
        break;
      case 'Friday':
        motivation = `${date}.\nFantastic Friday: Celebrate the upcoming weekend! <:partying_face:123456789012345678>`;
        break;
      case 'Saturday':
        motivation = `${date}.\nSunny Saturday: Enjoy the sunshine of the weekend. <:grinning_face:123456789012345678>`;
        break;
      case 'Sunday':
        motivation = `${date} \nSerene Sunday: Take a moment of calm and relaxation. Linggo ngayon ah sipag mo naman! <:exploding_head:123456789012345678>`;
        break;
      default:
        motivation = `${date}`;
    }

    if (attendance.length <= 0)
      return `${motivation}.\nEveryone ghosted us, no one is present! <:ghost:123456789012345678>`;

    if (attendance.length === 1)
      return `${motivation}.\nNot all heroes wear capes! Solo yern?\n1. ${
        attendance[0].username
      }, Logged @ ${moment(attendance[0].timeIn).format('HH:mm')} - logout @ ${
        attendance[0].timeOut
          ? moment(attendance[0].timeOut).format('HH:mm')
          : moment(attendance[0].expectedTimeOut).format('HH:mm')
      } <:superhero:123456789012345678>`;

    if (attendance.length > 1) {
      let result = `${motivation}\nTime Ranges <:clock9:123456789012345678>.\n`;
      attendance.forEach((item, index) => {
        const timeIn = moment(item.timeIn).format('HH:mm');
        let timeOut: string;
        let icon: string;
        if (!item.timeOut) {
          icon = '🙅‍♀️';
          const setTimeOut = moment(item.timeIn).add(9, 'hours').toDate();
          timeOut = moment(setTimeOut).format('HH:mm');
        } else {
          icon = '🙋‍♀️';
          timeOut = moment(item.timeOut).format('HH:mm');
        }
        result += `${index + 1}. ${
          item.username
        }, ${timeIn} - ${timeOut} ${icon}.\n`;
      });
      return result;
    }

    return motivation;
  }

  private absentResult(absents: DiscordUserModel[], now: Date): string {
    const date = moment(now).format('MMMM D, YYYY');
    const day = moment(now).format('dddd');
    let motivation: string;

    switch (day) {
      case 'Monday':
        motivation = `${date}.\nHappy Monday: Marvelous start to the week! <:hugging_face:123456789012345678>`;
        break;
      case 'Tuesday':
        motivation = `${date}.\nGorgeous Tuesday: Embrace the beauty in every moment. <:heart_eyes:123456789012345678>`;
        break;
      case 'Wednesday':
        motivation = `${date}.\nWhimsical Wednesday: Find joy in the middle of the week. <:winking_face:123456789012345678>`;
        break;
      case 'Thursday':
        motivation = `${date}.\nThoughtful Thursday: Reflect on the positive moments. <:star_struck:123456789012345678>`;
        break;
      case 'Friday':
        motivation = `${date}.\nFantastic Friday: Celebrate the upcoming weekend! <:partying_face:123456789012345678>`;
        break;
      case 'Saturday':
        motivation = `${date}.\nSunny Saturday: Enjoy the sunshine of the weekend. <:grinning_face:123456789012345678>`;
        break;
      case 'Sunday':
        motivation = `${date} \nSerene Sunday: Take a moment of calm and relaxation. Linggo ngayon ah sipag mo naman! <:exploding_head:123456789012345678>`;
        break;
      default:
        motivation = `${date}`;
    }
    if (absents.length <= 0)
      return `${motivation}.\nEveryone is present! <:star_struck:123456789012345678>`;

    if (absents.length >= 1) {
      let result = `${motivation}\nAbsent(s) List. <:ghost:123456789012345678>\n`;
      absents.forEach((item, index) => {
        result += `${index + 1}. ${item.username}\n`;
      });
      return result;
    }

    return motivation;
  }
}
