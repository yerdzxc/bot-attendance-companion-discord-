import { Inject, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { DrizzleService } from '@app/common/types/drizzle';
import { DRIZZLE } from '@app/common/drizzle/drizzle.module';
import { eq, inArray } from 'drizzle-orm';
import { DiscordUser } from '@app/common/drizzle/schema';
import { DiscordUserDto } from './dtos/discord-user.dto';

@Injectable()
export class UserService {
  constructor(@Inject(DRIZZLE) private db: DrizzleService) {}

  async exists(id: string): Promise<boolean> {
    const exists = await this.db.query.DiscordUser.findFirst({
      where: eq(DiscordUser.discordId, id),
    });
    return exists ? true : false;
  }

  async setBind(discordUserDto: DiscordUserDto) {
    const { command, ...rest } = discordUserDto;
    switch (command) {
      case 'bind':
        return await this.bindUser(rest);
      case 'bind-intern':
        return await this.bindIntern(rest);
    }
  }

  async bindUser(discordUserDto: {
    discordId: string;
    username: string;
    discriminator: string;
  }): Promise<string> {
    const exists = await this.exists(discordUserDto.discordId);
    await this.db
      .insert(DiscordUser)
      .values({
        ...discordUserDto,
        type: 'employee',
      })
      .onConflictDoUpdate({
        target: [DiscordUser.discordId],
        set: {
          type: 'employee',
          updated_at: new Date(),
        },
      });
    return this.buildMessage(exists, discordUserDto.username);
  }

  async bindIntern(discordUserDto: {
    discordId: string;
    username: string;
    discriminator: string;
  }): Promise<string> {
    const exists = await this.exists(discordUserDto.discordId);
    await this.db
      .insert(DiscordUser)
      .values({
        ...discordUserDto,
        type: 'intern',
      })
      .onConflictDoUpdate({
        target: [DiscordUser.discordId],
        set: {
          type: 'intern',
          updated_at: new Date(),
        },
      });
    return this.buildMessage(exists, discordUserDto.username);
  }

  async inactiveUser(): Promise<void> {
    const now = moment();
    // Step 1: Get all active users
    const users = await this.db.query.DiscordUser.findMany({
      where: eq(DiscordUser.active, true),
    });

    // Step 2: Filter those inactive for 30+ days
    const discordIds = users
      .filter(
        (user) =>
          !isNaN(now.diff(moment(user.lastAccess), 'days')) &&
          now.diff(moment(user.lastAccess), 'days') >= 30,
      )
      .map((user) => user.discordId);

    // Step 3: Update them to inactive
    if (discordIds.length > 0) {
      try {
        await this.db
          .update(DiscordUser)
          .set({ active: false })
          .where(inArray(DiscordUser.discordId, discordIds));
      } catch (err: any) {
        console.log(err?.response || err);
      }
    }
  }

  private buildMessage(exists: boolean, username: string): string {
    return `${username}, your account was succesfully ${
      exists ? 'updated' : 'binded'
    }. <:party_popper:123456789012345678>`;
  }
}
