import { Controller, Get, Post, Body, Param, Query, Put, Delete, Req, UseGuards } from '@nestjs/common';
import { EventService } from './event.service';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { EventCategory } from './event-category.enum';
import { PaginationDto } from 'src/common/ dto/pagination.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Event')
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createEvent(@Body() createEventDto: CreateEventDto): Promise<Event> {
    console.log("<<<yooo", createEventDto)
    return this.eventService.createEvent(createEventDto);
  }

  @Get('/private')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'List of private events with pagination metadata' })
  @ApiQuery({ name: 'dateFilter', required: false, type: String, description: 'Filter by date (today, tomorrow, this_week, this_month)' })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPrivateEvents(
    @Req() request: any,
    @Query('dateFilter') dateFilter?: string,
    @Query('category') category?: EventCategory,
    @Query('search') search?: string,
    @Query('page') page: number = 1, 
    @Query('limit') limit: number = 10, 
  ): Promise<PaginationDto<Event>> {
    const userId = request.user?.id;
    return this.eventService.getPrivateEvents(userId, dateFilter, category, search, page, limit);
  }

  @Get('/public')
  @ApiResponse({ status: 200, description: 'List of public events with pagination metadata' })
  @ApiQuery({ name: 'dateFilter', required: false, type: String, description: 'Filter by date (today, tomorrow, this_week, this_month)' })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPublicEvents(
    @Query('dateFilter') dateFilter?: string,
    @Query('category') category?: EventCategory,
    @Query('search') search?: string,
    @Query('page') page: number = 1, 
    @Query('limit') limit: number = 10,
  ): Promise<PaginationDto<Event>> {
    return this.eventService.getPublicEvents(dateFilter, category, search, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single event by ID' })
  @ApiResponse({ status: 200, description: 'Event found' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async getEventById(@Param('id') id: number): Promise<Event> {
    return this.eventService.getEventById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an event by ID' })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async updateEvent(
    @Param('id') id: number,
    @Body() updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    return this.eventService.updateEvent(id, updateEventDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an event by ID' })
  @ApiResponse({ status: 200, description: 'Event deleted successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async deleteEvent(@Param('id') id: number): Promise<void> {
    return this.eventService.deleteEvent(id);
  }
}
