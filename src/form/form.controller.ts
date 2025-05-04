import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { FormService } from './form.service';
import { Form } from './form.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SubmitPublicFormDto } from './ dto/submit-public-form.dto';
import { UpdateFormSettingsDto } from './ dto/update-form-settings.dto';

@ApiTags('Form') 
@Controller('forms')
export class FormController {
  constructor(private readonly formService: FormService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Successfully fetched forms', type: [Form] })
  findAll(): Promise<Form[]> {
    return this.formService.findAll();
  }

  @Get('public/:eventId')
  @ApiResponse({ status: 200, description: 'Successfully fetched forms', type: [Form] })
  async getPublicForm(@Param('eventId') eventId: number): Promise<Form> {
    return this.formService.getPublicFormWithFields(eventId);
  }

  @Get('rsvp/:eventId')
  @ApiOperation({ summary: 'Get RSVP form with fields' })
  @ApiResponse({ status: 200, description: 'RSVP form retrieved', type: Form })
  async getRsvpForm(@Param('eventId') eventId: number): Promise<Form> {
    return this.formService.getRsvpFormWithFields(eventId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new form' })
  @ApiResponse({ status: 201, description: 'Form created', type: Form })
  create(@Body() form: Form): Promise<Form> {
    return this.formService.create(form);
  }

  @Patch(':eventId/settings')
  @ApiOperation({ summary: 'Update public form settings' })
  async updateFormSettings(
    @Param('eventId') eventId: number,
    @Body() data: UpdateFormSettingsDto,
  ): Promise<Form> {
    return this.formService.updatePublicFormSetting(eventId, data);
  }

  @Post(':eventId/register')
  @ApiOperation({ summary: 'Submit responses to public form' })
  @ApiResponse({ status: 200, description: 'Successfully submitted' })
  async submitPublicForm(
    @Param('eventId') eventId: number,
    @Body() dto: SubmitPublicFormDto,
  ): Promise<{ message: string }> {
    await this.formService.handlePublicFormSubmission(eventId, dto);
    return { message: 'Зочин амжилттай бүртгэгдлээ' };
  }

  @Get('public/:eventId/responses')
  async getPublicResponses(@Param('eventId') eventId: number) {
    return this.formService.getPublicGuestResponses(eventId);
  }

  @Post(':eventId/rsvp/:guestId')
  @ApiOperation({ summary: 'RSVP form-д хариу өгөх' })
  async submitRsvpForm(
    @Param('eventId') eventId: number,
    @Param('guestId') guestId: number,
    @Body() dto: SubmitPublicFormDto,
  ): Promise<{ message: string }> {
    await this.formService.submitRsvpForm(eventId, guestId, dto);
    return { message: 'RSVP хариу амжилттай хадгалагдлаа' };
  }

  @Get('rsvp/:eventId/responses')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRsvpResponses(
    @Param('eventId') eventId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.formService.getRsvpGuestResponses(eventId, Number(page), Number(limit));
  }
}
