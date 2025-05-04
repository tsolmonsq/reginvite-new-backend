import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, Matches, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { EventCategory } from '../event-category.enum';

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  location: string;

  @ApiProperty()
  @IsString()
  date: string; // format: YYYY/MM/DD

  @ApiProperty()
  @IsString()
  start_time: string; // format: HH:mm

  @ApiProperty()
  @IsString()
  end_time: string; // format: HH:mm

  @ApiProperty()
  @IsBoolean()
  is_public: boolean;

  @ApiProperty({ enum: EventCategory })
  @IsEnum(EventCategory, { message: 'category must be a valid EventCategory' })
  category: EventCategory;

  @ApiProperty()
  @IsOptional()
  image_path: string;
}
