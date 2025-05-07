import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventCategory } from './event-category.enum';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { PaginationDto } from 'src/common/ dto/pagination.dto';
import { Template } from 'src/template/template.entity';
import { Invitation } from 'src/invitation/invitation.entity';
import { Form } from 'src/form/form.entity';
import { FormField } from 'src/form-field/form-field.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
    @InjectRepository(Form) 
    private formRepository: Repository<Form>,
    @InjectRepository(FormField) 
    private formFieldRepository: Repository<FormField>,
    private readonly dataSource: DataSource,
  ) {}

  async createEvent(createEventDto: CreateEventDto): Promise<Event> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      const event = this.eventRepository.create({
        ...createEventDto
      });
  
      const savedEvent = await queryRunner.manager.save(event);

      let template = await queryRunner.manager.findOne(Template, {
        where: {},
        order: { id: 'ASC' },
      });
  
      if (!template) {
        template = await queryRunner.manager.save(
          this.templateRepository.create({
            name: 'Template 1',
            html: `<div style="max-width: 600px; ...">{{RSVP_SECTION}}</div></div>`,
          }),
        );
      }

      const invitation = this.invitationRepository.create({
        color: '#D17D98',
        text_font: 'Arial',
        has_qr: true,
        has_rsvp: true,
        template,
        event: savedEvent,
      });
  
      await queryRunner.manager.save(invitation);
  
      const publicForm = this.formRepository.create({
        type: 'public',
        is_open: true,
        max_guests: 100, 
        close_at: createEventDto.end_date, 
        event: savedEvent,
      });
  
      const savedPublicForm = await queryRunner.manager.save(publicForm);
  
      const defaultFields = ['Овог', 'Нэр', 'Имэйл хаяг', 'Утасны дугаар'];
  
      for (const label of defaultFields) {
        const formField = this.formFieldRepository.create({
          label,
          type: 'text',
          is_required: true,
          form: savedPublicForm,
        });
        await queryRunner.manager.save(formField);
      }      
  
      const rsvpForm = this.formRepository.create({
        type: 'rsvp',
        is_open: false,
        max_guests: 0,
        close_at: createEventDto.end_date,
        event: savedEvent,
      });
  
      await queryRunner.manager.save(rsvpForm);
  
      await queryRunner.commitTransaction();
      return savedEvent;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to create event', error.message);
    } finally {
      await queryRunner.release();
    }
  }  
  
  async getPublicEvents(dateFilter?: string, category?: EventCategory, search?: string, page: number = 1, limit: number = 10): Promise<PaginationDto<Event>> {
    try {
      const query = this.eventRepository.createQueryBuilder('event');
      query.andWhere('event.is_public = true');

      this.applyFilters(query, dateFilter, category, search);

      this.applyPagination(query, page, limit);

      const [events, total] = await query.getManyAndCount();
      const totalPages = this.calculateTotalPages(total, limit);

      return new PaginationDto(events, total, totalPages, page, limit);
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve events', error.message);
    }
  }

  async getPrivateEvents(userId: number, dateFilter?: string, category?: EventCategory, search?: string, page: number = 1, limit: number = 10): Promise<PaginationDto<Event>> {
    try {
      const query = this.eventRepository.createQueryBuilder('event');
      query.andWhere('event.is_public = false AND event.user_id = :userId', { userId });

      this.applyFilters(query, dateFilter, category, search);

      this.applyPagination(query, page, limit);

      const [events, total] = await query.getManyAndCount();
      const totalPages = this.calculateTotalPages(total, limit);

      return new PaginationDto(events, total, totalPages, page, limit);
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve events', error.message);
    }
  }

  async getEventById(id: number): Promise<Event> {
    try {
      const event = await this.eventRepository.findOne({ where: { id } });
      if (!event) {
        throw new NotFoundException(`Event with id ${id} not found`);
      }
      return event;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch event by ID', error.message);
    }
  }
  
  async updateEvent(id: number, updateEventDto: UpdateEventDto): Promise<Event> {
    try {
      await this.eventRepository.update(id, updateEventDto);
      return this.getEventById(id);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update event', error.message);
    }
  }

  async deleteEvent(id: number): Promise<void> {
    try {
      const event = await this.getEventById(id);
      await this.eventRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete event', error.message);
    }
  } 

  private applyFilters(
    query,
    dateFilter?: string,
    category?: EventCategory,
    search?: string,
  ) {
    if (category) {
      query.andWhere('event.category = :category', { category });
    }
  
    if (search) {
      query.andWhere(
        'event.name LIKE :search OR event.description LIKE :search',
        { search: `%${search}%` },
      );
    }
  
    switch (dateFilter) {
      case 'today':
        query.andWhere(
          'event.start_date >= :startOfDay AND event.start_date <= :endOfDay',
          {
            startOfDay: startOfDay(new Date()),
            endOfDay: endOfDay(new Date()),
          },
        );
        break;
  
      case 'tomorrow': {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
  
        query.andWhere(
          'event.start_date >= :startOfDay AND event.start_date <= :endOfDay',
          {
            startOfDay: startOfDay(tomorrow),
            endOfDay: endOfDay(tomorrow),
          },
        );
        break;
      }
  
      case 'this_week':
        query.andWhere(
          'event.start_date >= :startOfWeek AND event.start_date <= :endOfWeek',
          {
            startOfWeek: startOfWeek(new Date()),
            endOfWeek: endOfWeek(new Date()),
          },
        );
        break;
  
      case 'this_month':
        query.andWhere(
          'event.start_date >= :startOfMonth AND event.start_date <= :endOfMonth',
          {
            startOfMonth: startOfMonth(new Date()),
            endOfMonth: endOfMonth(new Date()),
          },
        );
        break;
  
      default:
        break;
    }
  }  

  private applyPagination(query, page: number, limit: number) {
    const offset = (page - 1) * limit;
    query.skip(offset).take(limit);
  }

  private calculateTotalPages(total: number, limit: number): number {
    return Math.ceil(total / limit);
  }
}
