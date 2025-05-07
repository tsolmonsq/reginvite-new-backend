import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { PaginationService } from 'src/common/pagination.service';
import { Invitation } from 'src/invitation/invitation.entity';
import { Template } from 'src/template/template.entity';
import { TemplateModule } from 'src/template/template.module';
import { Form } from 'src/form/form.entity';
import { FormField } from 'src/form-field/form-field.entity';
import { FormModule } from 'src/form/form.module';
import { FormFieldModule } from 'src/form-field/form-field.module';
import { UserModule } from 'src/user/user.module';
import { User } from 'src/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Template, Invitation, Form, FormField, User]), TemplateModule, FormModule, FormFieldModule, UserModule],
  providers: [EventService, PaginationService],
  controllers: [EventController],
})
export class EventModule {}
