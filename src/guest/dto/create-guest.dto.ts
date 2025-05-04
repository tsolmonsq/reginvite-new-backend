import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsString } from "class-validator";

export class CreateGuestDto {
    @ApiProperty()
    @IsString()
    first_name: string;
  
    @ApiProperty()
    @IsString()
    last_name: string;
  
    @ApiProperty()
    @IsEmail()
    email: string;
  
    @ApiProperty()
    @IsString()
    phone_number: string;
  
    @ApiProperty()
    @IsNumber()
    event_id: number;
}
  