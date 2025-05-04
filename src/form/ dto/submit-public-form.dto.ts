import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString } from "class-validator";

export class ResponseInputDto {
    @ApiProperty()
    @IsNumber()
    fieldId: number;
  
    @ApiProperty()
    @IsString()
    value: string;
  }

  export class SubmitPublicFormDto {
    @ApiProperty({
      type: [ResponseInputDto],
      example: [
        { fieldId: 1, value: 'Бат' },
        { fieldId: 2, value: 'Тэмүүжин' },
        { fieldId: 3, value: 'temuujinb@gmail.com' },
        { fieldId: 4, value: '99119911' },
      ],
      description: 'Маягтаар бөглөсөн бүх талбаруудын утгууд',
    })
    @IsArray()
    responses: ResponseInputDto[];
  }