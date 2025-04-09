import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DiscordUserDto {
  @ApiProperty({ example: '12312312', required: true })
  discordId: string;

  @ApiProperty({ example: 'Julz', required: true })
  username: string;

  @ApiPropertyOptional()
  discriminator: string;

  @ApiProperty({
    examples: ['bind', 'bind-intern'],
    required: true,
    example: 'bind',
  })
  command: 'bind' | 'bind-intern';
}
