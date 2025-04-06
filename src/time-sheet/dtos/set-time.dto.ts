import { ApiProperty } from '@nestjs/swagger';

export class SetTimeDto {
  @ApiProperty({ example: '12312312', required: true })
  discordId: string;

  @ApiProperty({ example: 'Julz', required: true })
  username: string;

  @ApiProperty({
    examples: ['time-in', 'time-out'],
    required: true,
    example: 'time-in',
  })
  command: string;
}
