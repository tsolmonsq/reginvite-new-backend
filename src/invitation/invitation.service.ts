import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation } from './invitation.entity';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
  ) {}

  findAll(): Promise<Invitation[]> {
    return this.invitationRepository.find();
  }

  create(invitation: Invitation): Promise<Invitation> {
    return this.invitationRepository.save(invitation);
  }

  async findByEventId(eventId: number): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne({
      where: { event: { id: eventId } },
      relations: ['template', 'event'],
    });

    if (!invitation) {
      throw new NotFoundException(`Invitation for event ID ${eventId} not found`);
    }

    return invitation;
  }

  async updateQrSetting(eventId: number, has_qr: boolean): Promise<Invitation> {
    const invitation = await this.findByEventId(eventId);
    invitation.has_qr = has_qr;
    return this.invitationRepository.save(invitation);
  }
  
  async updateRsvpSetting(eventId: number, has_rsvp: boolean): Promise<Invitation> {
    const invitation = await this.findByEventId(eventId);
    invitation.has_rsvp = has_rsvp;
    return this.invitationRepository.save(invitation);
  }  

  async updateTemplateStyle(
    eventId: number,
    data: { template_id: number; color?: string; text_font?: string },
  ): Promise<Invitation> {
    const invitation = await this.findByEventId(eventId);
  
    invitation.template = { id: data.template_id } as any;
    if (data.color) invitation.color = data.color;
    if (data.text_font) invitation.text_font = data.text_font;
  
    return this.invitationRepository.save(invitation);
  }  
}
