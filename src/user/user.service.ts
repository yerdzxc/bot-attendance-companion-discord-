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

    async bindUser(discordUserDto: DiscordUserDto): Promise<string> {
        const { discordId, ...payload } = discordUserDto;
        const exists = await this.exists(discordId);
        if (exists) return `${payload.username}, your account is already binded. Sorry but I don't give second chance! <:melting_face:123456789012345678>`;
        await this.prisma.discordUser.create({
            data: {
                discordId: discordId,
                ...payload
            }
        });
        return `${payload.username}, your account was succesfully binded! <:party_popper:123456789012345678>`;
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
