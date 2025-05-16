import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer'; 

export class SendInviteDto {
  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  @Type(() => Number)
  guestIds: number[];

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Type(() => Number)
  invitationId: number;
}
