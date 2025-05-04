import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FormField } from './form-field.entity';
import { CreateFormFieldDto } from './dto/create-form-field.dto';
import { Form } from 'src/form/form.entity';

@Injectable()
export class FormFieldService {
  constructor(
    @InjectRepository(FormField)
    private readonly formFieldRepository: Repository<FormField>,

    @InjectRepository(Form)
    private readonly formRepository: Repository<Form>,
  ) {}

  findAll(): Promise<FormField[]> {
    return this.formFieldRepository.find();
  }

  async createField(dto: CreateFormFieldDto): Promise<FormField> {
    const form = await this.formRepository.findOne({ where: { id: dto.formId } });
    if (!form) throw new NotFoundException('Form not found');

    const field = this.formFieldRepository.create({
      label: dto.label,
      type: dto.type,
      is_required: dto.is_required,
      options: dto.options ?? undefined, 
      form,
    });

    return this.formFieldRepository.save(field);
  }
}
