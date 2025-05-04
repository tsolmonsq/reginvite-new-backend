// src/form-field/dto/create-form-field.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateFormFieldDto {
  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty()
  @IsString()
  type: string; // "text", "checkbox", "radio", etc.

  @ApiProperty()
  @IsBoolean()
  is_required: boolean;

  @ApiProperty()
  @IsOptional()
  @IsString()
  options?: string; // comma-separated (e.g. "Option1,Option2")

  @ApiProperty()
  @IsOptional()
  formId: number;
}
