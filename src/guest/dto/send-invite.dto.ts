import { ApiProperty } from '@nestjs/swagger';

export class SendInviteDto {
  @ApiProperty({ example: [1, 2, 3] })
  guestIds: number[];

  @ApiProperty({ example: 1 })
  templateId: number;
}
