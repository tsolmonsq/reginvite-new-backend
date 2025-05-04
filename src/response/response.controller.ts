import { Controller, Get, Post, Body } from '@nestjs/common';
import { ResponseService } from './response.service';
import { Response } from './response.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Response')  
@Controller('responses')
export class ResponseController {
  constructor(private readonly responseService: ResponseService) {}

  @Get()
  @ApiOperation({ summary: 'Get all responses' })
  @ApiResponse({ status: 200, description: 'Successfully fetched responses', type: [Response] })
  findAll(): Promise<Response[]> {
    return this.responseService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new response' })
  @ApiResponse({ status: 201, description: 'Response created', type: Response })
  create(@Body() response: Response): Promise<Response> {
    return this.responseService.create(response);
  }
}
