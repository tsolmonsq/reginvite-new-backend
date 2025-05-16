import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UserModule } from './user/user.module';
import { EventModule } from './event/event.module';
import { FormModule } from './form/form.module';
import { FormFieldModule } from './form-field/form-field.module';
import { ResponseModule } from './response/response.module';
import { GuestModule } from './guest/guest.module';
import { TemplateModule } from './template/template.module';
import { InvitationModule } from './invitation/invitation.module';
import { AuthModule } from './auth/auth.module';

// Entities
import { User } from './user/user.entity';
import { Form } from './form/form.entity';
import { FormField } from './form-field/form-field.entity';
import { Guest } from './guest/guest.entity';
import { Template } from './template/template.entity';
import { Invitation } from './invitation/invitation.entity';
import { Event } from './event/event.entity';
import { Response } from './response/response.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    // Serve static files
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), 
      serveRoot: '/uploads',                      
    }),
    
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [
        User,
        Event,
        Form,
        FormField,
        Response,
        Guest,
        Template,
        Invitation,
      ],
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
    }),

    AuthModule,
    UserModule,
    EventModule,
    FormModule,
    FormFieldModule,
    ResponseModule,
    GuestModule,
    TemplateModule,
    InvitationModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
