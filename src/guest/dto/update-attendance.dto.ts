import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAttendanceDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  is_attended: boolean;
}
