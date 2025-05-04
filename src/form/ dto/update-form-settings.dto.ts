import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsDateString } from 'class-validator';

export class UpdateFormSettingsDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  is_open: boolean;

  @ApiProperty({ example: 100 })
  @IsInt()
  maxGuests: number;

  @ApiProperty({ example: '2025-06-01T09:00:00.000Z' })
  @IsDateString()
  close_at: string;
}
