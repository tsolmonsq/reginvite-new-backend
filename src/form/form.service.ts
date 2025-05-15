import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Form } from './form.entity';
import { Guest } from 'src/guest/guest.entity';
import { SubmitPublicFormDto } from './ dto/submit-public-form.dto';
import { v4 as uuidv4 } from 'uuid'; 
import { FormField } from 'src/form-field/form-field.entity';
import { Response } from 'src/response/response.entity';
import { PaginationDto } from 'src/common/ dto/pagination.dto';
import { UpdateFormSettingsDto } from './ dto/update-form-settings.dto';
import { UpdateFormFieldDto } from 'src/form-field/dto/update-form-field.dto';

@Injectable()
export class FormService {
  constructor(
    @InjectRepository(Form)
    private readonly formRepository: Repository<Form>,

    @InjectRepository(Response)
    private readonly responseRepository: Repository<Response>,

    @InjectRepository(Guest)
    private readonly guestRepository: Repository<Guest>,

    @InjectRepository(FormField)
    private readonly formFieldRepository: Repository<FormField>,
  ) {}

  findAll(): Promise<Form[]> {
    return this.formRepository.find();
  }

  async getPublicFormWithFields(eventId: number): Promise<Form> {
    const form = await this.formRepository.findOne({
      where: {
        event: { id: eventId },
        type: 'public',
      },
      relations: ['formFields'],
    });
  
    if (!form) {
      throw new NotFoundException(`Public form not found for event ID ${eventId}`);
    }
  
    return form;
  }

  async getRsvpFormWithFields(eventId: number): Promise<Form> {
    const form = await this.formRepository.findOne({
      where: {
        event: { id: eventId },
        type: 'rsvp',
      },
      relations: ['formFields'],
    });

    if (!form) {
      throw new NotFoundException(`RSVP form not found for event ID ${eventId}`);
    }

    return form;
  }

  async updatePublicFormSetting(
    eventId: number,
    data: UpdateFormSettingsDto,
  ): Promise<Form> {
    const form = await this.formRepository.findOne({
      where: { event: { id: eventId }, type: 'public' },
    });
  
    if (!form) throw new NotFoundException(`Public form not found for event ${eventId}`);
  
    form.is_open = data.is_open;
    form.max_guests = data.maxGuests;

    console.log("<<<MAX ", form.max_guests)
  
    const parsedDate = new Date(data.close_at);
    if (isNaN(parsedDate.getTime())) {
      throw new BadRequestException('Invalid close_at date');
    }
  
    form.close_at = parsedDate;
  
    return this.formRepository.save(form);
  }

  create(form: Form): Promise<Form> {
    return this.formRepository.save(form);
  }

  async handlePublicFormSubmission(eventId: number, dto: SubmitPublicFormDto): Promise<void> {
    const form = await this.formRepository.findOne({
      where: { event: { id: eventId }, type: 'public' },
      relations: ['formFields'],
    });
  
    if (!form || !form.is_open) {
      throw new BadRequestException('Форм хаалттай байна.');
    }
  
    const now = new Date();
    if (now > new Date(form.close_at)) {
      throw new BadRequestException('Формын хугацаа дууссан байна.');
    }

    if (form.total_registrations >= form.max_guests) {
      throw new BadRequestException('Бүртгүүлэх зочдын хязгаар хүрсэн байна.');
    }

    const responseMap = new Map(dto.responses.map(r => [r.fieldId, r.value]));
  
    const getValueByLabel = (label: string): string => {
      const field = form.formFields.find(f => f.label === label);
      return field ? responseMap.get(field.id) || '' : '';
    };
  
    const guest = this.guestRepository.create({
      first_name: getValueByLabel('Нэр'),
      last_name: getValueByLabel('Овог'),
      email: getValueByLabel('Имэйл хаяг'),
      phone_number: getValueByLabel('Утасны дугаар'),
      status: 'By form',
      is_attended: false,
      qr_token: uuidv4(),
      event: { id: eventId },
    });
  
    const savedGuest = await this.guestRepository.save(guest);

    const fieldIds = dto.responses.map((r) => r.fieldId);
    const fields = await this.formRepository.manager.findBy(FormField, { id: In(fieldIds) });
  
    const responses: Response[] = dto.responses.map((r) => {
      const field = fields.find((f) => f.id === r.fieldId);
      if (!field) throw new NotFoundException(`Field ID ${r.fieldId} not found`);
  
      return this.responseRepository.create({
        value: r.value,
        filled_date: new Date(),
        guest: savedGuest,
        formField: field,
      });
    });
  
    await this.responseRepository.save(responses);

    form.total_registrations += 1;
    await this.formRepository.save(form);
  }  

  async getPublicGuestResponses(eventId: number, page = 1, limit = 10): Promise<PaginationDto<any>> {
    const form = await this.formRepository.findOne({
      where: { event: { id: eventId }, type: 'public' },
      relations: ['formFields'],
    });
  
    if (!form) throw new NotFoundException('Public form not found');
  
    const query = this.guestRepository.createQueryBuilder('guest')
      .where('guest.event_id = :eventId', { eventId })
      .andWhere('guest.status = :status', { status: 'By form' })
      .leftJoinAndSelect('guest.responses', 'response')
      .leftJoinAndSelect('response.formField', 'formField');
  
    const total = await query.getCount();
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
  
    const guests = await query
      .skip(offset)
      .take(limit)
      .getMany();
  
    const items = guests.map((guest) => {
      const defaultFields = {
        id: guest.id,
        last_name: guest.last_name,
        first_name: guest.first_name,
        email: guest.email,
        phone_number: guest.phone_number,
      };
  
      const extraResponses = guest.responses
        .map((r) => ({
          label: r.formField?.label,
          value: r.value,
        }))
        .filter(r => !['Овог', 'Нэр', 'Имэйл хаяг', 'Утасны дугаар'].includes(r.label));
  
      return {
        ...defaultFields,
        fields: extraResponses,
      };
    });
  
    return new PaginationDto(items, total, totalPages, page, limit);
  }

  async submitRsvpForm(eventId: number, guestId: number, dto: SubmitPublicFormDto): Promise<void> {
    const form = await this.getRsvpFormWithFields(eventId);
  
    const guest = await this.guestRepository.findOne({
      where: { id: guestId },
      relations: ['event'],
    });
  
    if (!guest) {
      throw new NotFoundException('Guest not found');
    }
  
    if (guest.event.id !== eventId) {
      throw new BadRequestException('This guest does not belong to the event');
    }
  
    if (guest.status !== 'Sent') {
      throw new BadRequestException('Урилга илгээгдсэн зочин л RSVP бөглөж болно.');
    }
  
    const existing = await this.responseRepository.findOne({
      where: { guest: { id: guestId } },
      relations: ['formField'],
    });
  
    if (existing) {
      throw new BadRequestException('Та аль хэдийн RSVP хариу өгсөн байна.');
    }
  
    const fieldIds = dto.responses.map((r) => r.fieldId);
    const fields = await this.formRepository.manager.findBy(FormField, { id: In(fieldIds) });
  
    const responses: Response[] = dto.responses.map((r) => {
      const field = fields.find((f) => f.id === r.fieldId);
      if (!field) throw new NotFoundException(`Field ID ${r.fieldId} not found`);
  
      return this.responseRepository.create({
        value: r.value,
        filled_date: new Date(),
        guest: guest,
        formField: field,
      });
    });
  
    await this.responseRepository.save(responses);

    form.total_submissions += 1;
    await this.formRepository.save(form);
  }  

  async getRsvpGuestResponses(eventId: number, page = 1, limit = 10): Promise<PaginationDto<any>> {
    const form = await this.formRepository.findOne({
      where: { event: { id: eventId }, type: 'rsvp' },
      relations: ['formFields'],
    });
  
    if (!form) throw new NotFoundException('RSVP form not found');
  
    const [guests, total] = await this.guestRepository.findAndCount({
      where: { event: { id: eventId } },
      relations: ['responses', 'responses.formField', 'responses.formField.form'],
      skip: (page - 1) * limit,
      take: limit,
    });
  
    const items = guests
      .map((guest) => {
        const rsvpResponses = guest.responses.filter(
          (r) => r.formField?.form?.id === form.id
        );
  
        if (rsvpResponses.length === 0) return null;
  
        return {
          id: guest.id,
          last_name: guest.last_name,
          first_name: guest.first_name,
          email: guest.email,
          phone_number: guest.phone_number,
          fields: rsvpResponses.map((r) => ({
            label: r.formField?.label,
            value: r.value,
          })),
        };
      })
      .filter((g) => g !== null);
  
    const totalPages = Math.ceil(total / limit);
    return new PaginationDto(items, total, totalPages, page, limit);
  }  

  async getPublicFormRegistrationsCount(eventId: number): Promise<string> {
    const form = await this.formRepository.findOne({
      where: { event: { id: eventId }, type: 'public' },
    });
  
    if (!form) {
      throw new Error('Public form not found for event ID ' + eventId);
    }
    
    const registrationsCount = await this.guestRepository.count({
      where: { event: { id: eventId }, status: 'By form' },
    });
  
    const maxGuests = form.max_guests;
  
    return `${registrationsCount} / ${maxGuests}`;
  }

  async appendNewFields(eventId: number, fields: UpdateFormFieldDto[]) {
    const form = await this.formRepository.findOne({
      where: { event: { id: eventId } },
      relations: ['formFields'],
    });
  
    if (!form) throw new NotFoundException('Form not found');
  
    // Аль хэдийн орсон талбаруудын label-ууд
    const existingLabels = form.formFields.map(f => f.label);
  
    // Зөвхөн шинээр нэмэгдэхүүд
    const newFields = fields
      .filter(f => !existingLabels.includes(f.label))
      .map(f =>
        this.formFieldRepository.create({
          form,
          label: f.label,
          type: f.type,
          is_required: f.is_required,
          options: f.options || '',
        }),
      );
  
    if (newFields.length > 0) {
      await this.formFieldRepository.save(newFields);
    }
  
    return {
      message: `${newFields.length} шинэ талбар нэмэгдлээ.`,
      addedLabels: newFields.map(f => f.label),
    };
  }
}
