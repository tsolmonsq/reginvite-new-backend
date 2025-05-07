import { ApiProperty } from '@nestjs/swagger';
import { EventCategory } from '../event-category.enum';
import { IsString, IsNotEmpty, IsBoolean, IsEnum, IsDateString, IsOptional } from 'class-validator';

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty()
  @IsDateString()
  start_date: string;

  @ApiProperty()
  @IsDateString()
  end_date: string;

  @ApiProperty()
  @IsBoolean()
  is_public: boolean;

  @ApiProperty({ enum: EventCategory })
  @IsEnum(EventCategory)
  category: EventCategory;

  @ApiProperty()
  @IsString()
  image_path: string;

  @IsOptional()
  @ApiProperty()
  user_id?: string;
}
