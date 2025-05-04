import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { Invitation } from './invitation.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdateInvitationTemplateDto } from './ dto/update-template.dto';

@ApiTags('Invitation')
@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Get(':eventId')
  @ApiOperation({ summary: 'Get invitation by event ID' })
  @ApiResponse({ status: 200, type: Invitation })
  async getByEventId(@Param('eventId') eventId: number): Promise<Invitation> {
    const invitation = await this.invitationService.findByEventId(eventId);
    if (!invitation) {
      throw new NotFoundException(`Invitation for event ID ${eventId} not found`);
    }
    return invitation;
  }

  @Patch(':eventId/qr')
  @ApiResponse({ status: 200, type: Invitation })
  async updateQr(
    @Param('eventId') eventId: number,
    @Body() body: { has_qr: boolean },
  ): Promise<Invitation> {
    return this.invitationService.updateQrSetting(eventId, body.has_qr);
  }

  @Patch(':eventId/rsvp')
  @ApiResponse({ status: 200, type: Invitation })
  async updateRsvp(
    @Param('eventId') eventId: number,
    @Body() body: { has_rsvp: boolean },
  ): Promise<Invitation> {
    return this.invitationService.updateRsvpSetting(eventId, body.has_rsvp);
  }

  @Patch(':eventId/template')
  @ApiOperation({ summary: 'Update template, color, font of an invitation' })
  @ApiResponse({ status: 200, type: Invitation })
  async updateTemplateStyle(
    @Param('eventId') eventId: number,
    @Body() data: UpdateInvitationTemplateDto,
  ): Promise<Invitation> {
    return this.invitationService.updateTemplateStyle(eventId, data);
  }
}
