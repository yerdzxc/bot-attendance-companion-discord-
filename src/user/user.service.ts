import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { DiscordUserDto } from './dtos/discord-user.dto';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    async exists(id: string) {
        const exists = await this.prisma.discordUser.findFirst({ where: { discordId: id } })
        return exists ? true : false;
    }

    async bindUser(discordUserDto: DiscordUserDto) {
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
}
