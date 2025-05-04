import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsBoolean()
  is_organization: boolean;

  @ApiProperty()
  @IsOptional()
  @IsString()
  organization_name?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  role: string;
}
