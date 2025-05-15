import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    transform: true,  // Automatically transform payloads into DTOs
    whitelist: true,  // Automatically strip properties that are not in the DTO
  }));

  const config = new DocumentBuilder()
    .setTitle('RegInvite API')
    .setDescription('The event invitation and guest registration API')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token', 
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);  

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  //Зураг upload хийх. 
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  await app.listen("3002");
}
bootstrap();
