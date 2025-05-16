import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
    private resendClient: Resend;

    constructor(private configService: ConfigService) {
        this.resendClient = new Resend(this.configService.get<string>('RESEND_API_KEY'));
    }

    async sendEmail(to: string, subject: string, htmlBody: string): Promise<any> {
        try {
            const email = await this.resendClient.emails.send({
                from: 'send@reginvite.site',
                to,
                subject,
                html: htmlBody,
            });
            return email;
        } catch (error) {
            throw new Error('Error sending email: ' + error.message);
        }
    }
}
