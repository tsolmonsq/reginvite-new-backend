import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MailService } from './mail.service'; 

@ApiTags('email')
@Controller('email')
export class EmailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send an email with a QR code' })
  @ApiResponse({
    status: 200,
    description: 'The email has been sent successfully.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error sending the email.',
  })
  async sendEmail() {
    const qrData = 'https://example.com'; 
    const result = await this.mailService.sendMail(
      'tsolmonbatbold88@gmail.com',  
      'Test Email with QR Code',
      'Hello, this email contains a QR code!',
      qrData
    );
    return result;
  }
}
