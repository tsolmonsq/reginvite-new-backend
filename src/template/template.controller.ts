import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { TemplateService } from './template.service';
import { Template } from './template.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@ApiTags('Template')  
@Controller('templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Get()
  @ApiOperation({ summary: 'Get all templates' })
  @ApiResponse({ status: 200, description: 'Successfully fetched templates', type: [Template] })
  findAll(): Promise<Template[]> {
    return this.templateService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new template' })
  @ApiResponse({ status: 201, description: 'Template created', type: Template })
  create(@Body() createTemplateDto: CreateTemplateDto): Promise<Template> {
    return this.templateService.createTemplate(createTemplateDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a template' })
  async update(
    @Param('id') id: number,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ): Promise<Template> {
    return this.templateService.updateTemplate(+id, updateTemplateDto);
  }
}
