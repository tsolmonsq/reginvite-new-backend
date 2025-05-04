import { Controller, Get, Post, Body } from '@nestjs/common';
import { FormFieldService } from './form-field.service';
import { FormField } from './form-field.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateFormFieldDto } from './dto/create-form-field.dto';

@ApiTags('Form Field') 
@Controller('formFields')
export class FormFieldController {
  constructor(private readonly formFieldService: FormFieldService) {}

  @Get()
  @ApiOperation({ summary: 'Get all form fields' })
  @ApiResponse({ status: 200, description: 'Successfully fetched form fields', type: [FormField] })
  findAll(): Promise<FormField[]> {
    return this.formFieldService.findAll();
  }
  
  @Post()
  create(@Body() dto: CreateFormFieldDto): Promise<FormField> {
    return this.formFieldService.createField(dto);
  }
}
