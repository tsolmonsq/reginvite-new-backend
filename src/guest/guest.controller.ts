import { Controller, Get, Post, Body, UseInterceptors, UploadedFile, Query, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { GuestService } from './guest.service';
import { Guest } from './guest.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateGuestDto } from './dto/create-guest.dto';
import { Express } from 'express';
import { PaginationDto } from 'src/common/ dto/pagination.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { SendInviteDto } from './dto/send-invite.dto';

@ApiTags('Guest')  
@Controller('guests')
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  @Get()
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'is_attended', required: false, type: Boolean })
  async getGuestsByEvent(
    @Query('eventId') eventId: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('is_attended') is_attended?: boolean,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<PaginationDto<Guest>> {
    return this.guestService.getGuestsByEvent(eventId, status, search, page, limit, is_attended);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a guest by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Guest found' })
  @ApiResponse({ status: 404, description: 'Guest not found' })
  async getGuestById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Guest> {
    return this.guestService.findOneById(id);
  }

  @Post()
  createGuest(@Body() guestDto: CreateGuestDto): Promise<Guest> {
    return this.guestService.createGuestManually(guestDto);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiQuery({ name: 'eventId', type: Number, required: true }) 
  async importGuestsFromExcel(
    @UploadedFile() file: Express.Multer.File,
    @Query('eventId') eventId: number,
  ): Promise<{ imported: number }> {
    const guests = await this.guestService.parseAndSaveExcel(file.buffer, eventId);
    return { imported: guests.length };
  }

  @Patch(':id/attendance')
  @ApiOperation({ summary: 'Update guest attendance manually' })
  async updateAttendance(
    @Param('id') id: number,
    @Body() dto: UpdateAttendanceDto,
  ): Promise<Guest> {
    return this.guestService.updateAttendance(id, dto.is_attended);
  }

  @Patch('/checkin/:token')
  @ApiOperation({ summary: 'Check in guest by QR token' })
  async checkInGuest(@Param('token') token: string): Promise<Guest> {
    return this.guestService.checkInByQrToken(token);
  }

  @Post('send-invites')
  @ApiResponse({ status: 201, description: 'Илгээх амжилттай' })
  async sendInvites(@Body() dto: SendInviteDto) {
    console.log('DTO:', dto);
    console.log('guestIds type:', typeof dto.guestIds);
    console.log('Array.isArray:', Array.isArray(dto.guestIds));
    return this.guestService.sendInvitations(dto.guestIds, dto.invitationId);
  }
}
