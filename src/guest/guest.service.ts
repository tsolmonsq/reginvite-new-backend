import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Guest } from './guest.entity';
import { PaginationDto } from 'src/common/ dto/pagination.dto';
import { CreateGuestDto } from './dto/create-guest.dto';
import * as xlsx from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from 'src/email/email.service';
import { Invitation } from 'src/invitation/invitation.entity';
import { ConfigService } from '@nestjs/config';
import { QRCodeService } from 'src/qr/qr-code.service';

interface ExcelGuestRow {
  Нэр: string;
  Овог: string;
  'Имэйл хаяг': string;
  'Утасны дугаар': string;
}

@Injectable()
export class GuestService {
  constructor(
    @InjectRepository(Guest)
    private readonly guestRepository: Repository<Guest>,

    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,

    private readonly emailService: EmailService, 

    private readonly configService: ConfigService,

    private qrCodeService: QRCodeService,
  ) {}
  
  async getGuestsByEvent(
    eventId: number,
    status?: string,
    search?: string,
    page: number = 1,
    limit: number = 10,
    is_attended?: boolean, // ← нэмэгдсэн
  ): Promise<PaginationDto<Guest>> {
    const query = this.guestRepository.createQueryBuilder('guest')
      .where('guest.event_id = :eventId', { eventId });
  
    if (status) {
      query.andWhere('guest.status = :status', { status });
    }
  
    if (typeof is_attended === 'boolean') {
      query.andWhere('guest.is_attended = :is_attended', { is_attended });
    }
  
    if (search) {
      query.andWhere(
        '(guest.first_name ILIKE :search OR guest.last_name ILIKE :search OR guest.email ILIKE :search OR guest.phone_number ILIKE :search)',
        { search: `%${search}%` },
      );
    }
  
    this.applyPagination(query, page, limit);
  
    const [guests, total] = await query.getManyAndCount();
    const totalPages = this.calculateTotalPages(total, limit);
  
    return new PaginationDto(guests, total, totalPages, page, limit);
  }  

  async findOneById(id: number): Promise<Guest> {
    const guest = await this.guestRepository.findOne({
      where: { id },
      relations: ['event', 'responses'], 
    });
  
    if (!guest) {
      throw new NotFoundException(`Guest with ID ${id} not found`);
    }
  
    return guest;
  }  

  async createGuestManually(guestDto: CreateGuestDto): Promise<Guest> {
    const guest = this.guestRepository.create({
      first_name: guestDto.first_name,
      last_name: guestDto.last_name,
      email: guestDto.email,
      phone_number: guestDto.phone_number,
      status: 'New',
      is_attended: false,
      qr_token: uuidv4(), 
      event: { id: guestDto.event_id },
    });
  
    return this.guestRepository.save(guest);
  }

  async parseAndSaveExcel(fileBuffer: Buffer, eventId: number): Promise<Guest[]> {
    const workbook = xlsx.read(fileBuffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);
  
    const guests: Guest[] = [];
  
    for (const row of data as ExcelGuestRow[]) {
      const guest = this.guestRepository.create({
        first_name: row['Нэр'],
        last_name: row['Овог'],
        email: row['Имэйл хаяг'],
        phone_number: row['Утасны дугаар'],
        status: 'New',
        is_attended: false,
        qr_token: uuidv4(), 
        event: { id: eventId },
      });
    
      guests.push(await this.guestRepository.save(guest));
    }
  
    return guests;
  }

  async updateAttendance(id: number, is_attended: boolean): Promise<Guest> {
    const guest = await this.guestRepository.findOne({ where: { id } });
  
    if (!guest) {
      throw new NotFoundException(`Guest with ID ${id} not found`);
    }
  
    guest.is_attended = is_attended;
    return this.guestRepository.save(guest);
  }

  async checkInByQrToken(token: string): Promise<Guest> {
    const guest = await this.guestRepository.findOne({ where: { qr_token: token } });
  
    if (!guest) {
      throw new NotFoundException('QR token is invalid or guest not found');
    }
  
    if (guest.is_attended) {
      throw new Error('Guest has already checked in');
    }
  
    guest.is_attended = true;
    return this.guestRepository.save(guest);
  }  

  private applyPagination(query, page: number, limit: number) {
    const offset = (page - 1) * limit;
    query.skip(offset).take(limit);
  }

  private calculateTotalPages(total: number, limit: number): number {
    return Math.ceil(total / limit);
  }

  async sendInvitations(guestIds: number[], invitationId: number) {
    const guests = await this.guestRepository.find({
      where: { id: In(guestIds) },
      relations: ['event'],
    });
  
    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId },
      relations: ['template'],
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }
  
    const baseUrl = this.configService.get('BASE_URL');
  
    for (const guest of guests) {
      try {
        const qrUrl = `${baseUrl}/guests/checkin/${guest.qr_token}`;
        const filename = `${guest.qr_token}.png`;
  
        // QR image үүсгээд хадгалах
        const qrImagePath = await this.qrCodeService.generateImageFile(qrUrl, filename);
        const fullQrUrl = `${baseUrl}${qrImagePath}`;
  
        // Урилгын HTML-ийг бүрдүүлэх
        const html = invitation.template.html
          .replaceAll('{{TITLE}}', guest.event.name || '')
          .replaceAll('{{DESCRIPTION}}', guest.event.description || '')
          .replaceAll('{{LOCATION}}', guest.event.location || '')
          .replaceAll('{{START_DATE}}', guest.event.start_date?.toLocaleString('mn-MN') || '')
          .replaceAll('{{END_DATE}}', guest.event.end_date?.toLocaleString('mn-MN') || '')
          .replaceAll('{{COLOR}}', invitation.color || '')
          .replaceAll('{{FONT}}', invitation.text_font || 'Arial') 
          .replaceAll('{{QR_SECTION}}', `<img src="${fullQrUrl}" width="120" alt="QR Code" />`);
  
        const subject = `Урилга: ${guest.event.name || 'Таны эвент'}`;
  
        await this.emailService.sendEmail(guest.email, subject, html);
  
        // Амжилттай илгээсэн бол статусыг шинэчлэх
        await this.guestRepository.update(guest.id, { status: 'Sent' });
  
      } catch (error) {
        console.error('EMAIL ERROR:', error);
      }
    }
  
    return { message: 'Илгээх процесс амжилттай дууссан' };
  }  
}
