import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';

@Injectable()
export class MailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('GMAIL_USER'),
        pass: this.configService.get('GMAIL_PASS'),
      },
    });
  }

  // Method to send email with HTML content and embedded QR code
  async sendMail(to: string, subject: string, text: string, qrData: string) {
    try {
      // Generate QR code
      const qrCode = await QRCode.toDataURL(qrData);

      // HTML email content
      const htmlContent = `
        <div>
          <h1>${subject}</h1>
          <p>${text}</p>
          <p>Scan this QR code:</p>
          <img src="${qrCode}" alt="QR Code" />
        </div>
      `;

      const info = await this.transporter.sendMail({
        from: this.configService.get('GMAIL_USER'),
        to,
        subject,
        text,
        html: htmlContent,
      });

      console.log('Message sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email', error);
      throw new Error('Error sending email');
    }
  }
}
