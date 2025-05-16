import { Module } from '@nestjs/common';
import { GuestService } from './guest.service';
import { GuestController } from './guest.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guest } from './guest.entity';
import { EmailService } from 'src/email/email.service';
import { Invitation } from 'src/invitation/invitation.entity';
import { QRCodeService } from 'src/qr/qr-code.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Guest, Invitation])],
  providers: [GuestService, EmailService, QRCodeService, ConfigService],
  controllers: [GuestController],
})
export class GuestModule {}
