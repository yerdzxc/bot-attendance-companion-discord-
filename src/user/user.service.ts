import { Inject, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { DrizzleService } from '@app/common/types/drizzle';
import { DRIZZLE } from '@app/common/drizzle/drizzle.module';
import { eq, inArray, and } from 'drizzle-orm';
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

  async setBind(discordUserDto: DiscordUserDto): Promise<string> {
    const { command, ...rest } = discordUserDto;
    switch (command) {
      case 'bind':
        return await this.bindUser(rest);
      case 'bind-intern':
        return await this.bindIntern(rest);
      default:
        return 'Invalid Command <:woman_facepalming:123456789012345678>';
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

  async setRestDay(discordId: string, restDay: string | null): Promise<string> {
    await this.db
      .update(DiscordUser)
      .set({ restDay, updated_at: new Date() })
      .where(eq(DiscordUser.discordId, discordId));
    return restDay ? `Rest day set to ${restDay}.` : 'Rest day cleared.';
  }

  async setName(discordId: string, username: string): Promise<string> {
    const exists = await this.exists(discordId);
    if (!exists)
      return `Account not found. Run '/bind' first. <:woman_facepalming:123456789012345678>`;

    await this.db
      .update(DiscordUser)
      .set({ username, updated_at: new Date() })
      .where(eq(DiscordUser.discordId, discordId));

    return `${username}, your display name was updated. <:party_popper:123456789012345678>`;
  }

  async listUsers(type?: 'employee' | 'intern', active?: boolean) {
    const filters: any[] = [];
    if (active !== undefined) filters.push(eq(DiscordUser.active, active));
    if (type) filters.push(eq(DiscordUser.type, type));
    return this.db.query.DiscordUser.findMany({
      where: filters.length ? and(...filters) : undefined,
      orderBy: DiscordUser.username,
    });
  }

  async setActive(discordId: string, active: boolean): Promise<string> {
    await this.db
      .update(DiscordUser)
      .set({ active, updated_at: new Date() })
      .where(eq(DiscordUser.discordId, discordId));
    return active ? 'User reactivated.' : 'User deactivated.';
  }

  async setPosition(discordId: string, position: string | null): Promise<string> {
    await this.db
      .update(DiscordUser)
      .set({ position, updated_at: new Date() })
      .where(eq(DiscordUser.discordId, discordId));
    return position ? `Position set to ${position}.` : 'Position cleared.';
  }

  async setType(discordId: string, type: 'employee' | 'intern'): Promise<string> {
    await this.db
      .update(DiscordUser)
      .set({ type, updated_at: new Date() })
      .where(eq(DiscordUser.discordId, discordId));
    return `User type changed to ${type}.`;
  }

  async batchSetActive(discordIds: string[], active: boolean): Promise<string> {
    await this.db
      .update(DiscordUser)
      .set({ active, updated_at: new Date() })
      .where(inArray(DiscordUser.discordId, discordIds));
    return `${discordIds.length} user(s) ${active ? 'reactivated' : 'deactivated'}.`;
  }

  async batchSetType(discordIds: string[], type: 'employee' | 'intern'): Promise<string> {
    await this.db
      .update(DiscordUser)
      .set({ type, updated_at: new Date() })
      .where(inArray(DiscordUser.discordId, discordIds));
    return `${discordIds.length} user(s) type changed to ${type}.`;
  }

  private buildMessage(exists: boolean, username: string): string {
    return `${username}, your account was succesfully ${
      exists ? 'updated' : 'binded'
    }. <:party_popper:123456789012345678>`;
  }
}
