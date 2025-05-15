import { forwardRef, Module } from '@nestjs/common';
import { FormFieldService } from './form-field.service';
import { FormFieldController } from './form-field.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormField } from './form-field.entity';
import { Form } from 'src/form/form.entity';
import { FormModule } from 'src/form/form.module';
import { Response } from 'src/response/response.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FormField, Form, Response]), 
    forwardRef(() => FormModule)
  ],
  providers: [FormFieldService],
  controllers: [FormFieldController],
})
export class FormFieldModule {}
