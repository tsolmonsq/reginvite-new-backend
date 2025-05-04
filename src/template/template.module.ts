import { Module } from '@nestjs/common';
import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Template } from './template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Template])],
  providers: [TemplateService],
  controllers: [TemplateController],
  exports: [TypeOrmModule]
})
export class TemplateModule {}
