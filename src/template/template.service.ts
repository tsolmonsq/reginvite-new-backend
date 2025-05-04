import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from './template.entity';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
  ) {}

  findAll(): Promise<Template[]> {
    return this.templateRepository.find();
  }

  async createTemplate(createTemplateDto: CreateTemplateDto): Promise<Template> {
      try {
        const event = this.templateRepository.create(createTemplateDto);
        return await this.templateRepository.save(event);
      } catch (error) {
        throw new InternalServerErrorException('Failed to create event', error.message);
      }
  }

  async updateTemplate(id: number, updateTemplateDto: UpdateTemplateDto): Promise<Template> {
    const template = await this.templateRepository.findOne({ where: { id } });
  
    if (!template) {
      throw new InternalServerErrorException(`Template with ID ${id} not found`);
    }
  
    Object.assign(template, updateTemplateDto);
  
    try {
      return await this.templateRepository.save(template);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update template', error.message);
    }
  }  
}
