import { forwardRef, Module } from '@nestjs/common';
import { FormService } from './form.service';
import { FormController } from './form.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Form } from './form.entity';
import { Guest } from 'src/guest/guest.entity';
import { GuestModule } from 'src/guest/guest.module';
import { ResponseModule } from 'src/response/response.module';
import { FormField } from 'src/form-field/form-field.entity';
import { Response } from 'src/response/response.entity';
import { FormFieldModule } from 'src/form-field/form-field.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Form, FormField, Response, Guest]),
    ResponseModule, 
    GuestModule, 
    forwardRef(() => FormFieldModule),
  ],
  providers: [FormService],
  controllers: [FormController],
})
export class FormModule {}
