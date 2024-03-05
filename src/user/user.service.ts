import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { DiscordUserDto } from './dtos/discord-user.dto';
import * as moment from 'moment';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    async exists(id: string): Promise<boolean> {
        const exists = await this.prisma.discordUser.findFirst({ where: { discordId: id } })
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

    async bindUser(discordUserDto: { discordId: string, username: string, discriminator: string }): Promise<string> {
        const { discordId, ...rest } = discordUserDto;
        const exists = await this.exists(discordId);
        const message = exists ?
            `${rest.username}, your account was succesfully updated! <:party_popper:123456789012345678>` :
            `${rest.username}, your account was succesfully binded! <:party_popper:123456789012345678>`;
        await this.prisma.discordUser.upsert({
            where: { discordId: discordId },
            update: { type: 'employee' },
            create: {
                discordId: discordId,
                ...rest
            }
        })
        return message;
    }

    async bindIntern(payload: { discordId: string, username: string, discriminator: string }): Promise<string> {
        const { discordId, ...rest } = payload;
        const exists = await this.exists(discordId);
        const message = exists ?
            `${rest.username}, your account was succesfully updated! <:party_popper:123456789012345678>` :
            `${rest.username}, your account was succesfully binded! <:party_popper:123456789012345678>`;
        await this.prisma.discordUser.upsert({
            where: { discordId: discordId },
            update: { type: 'intern' },
            create: {
                discordId: discordId,
                type: 'intern',
                ...rest
            }
        })
        return message;
    }

    async inactiveUser(): Promise<void> {
        const now = moment();
        const users = await this.prisma.discordUser.findMany({
            where: {
                active: true
            }
        });
        const discordsIds = users
            .filter(user => !isNaN(now.diff(moment(user.lastAccess), 'days')))
            .filter(user => now.diff(moment(user.lastAccess), 'days') >= 30)
            .map(user => user.discordId);
        try {
            await this.prisma.discordUser.updateMany({
                where: {
                    discordId: { in: discordsIds }
                },
                data: {
                    active: false
                }
            });
        } catch (err: any) {
            console.log(err.response);
        }
    }
}
