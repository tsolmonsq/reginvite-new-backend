import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTemplateDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  html: string;
}
