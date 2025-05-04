import { Module } from '@nestjs/common';
import { GuestService } from './guest.service';
import { GuestController } from './guest.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guest } from './guest.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Guest])],
  providers: [GuestService],
  controllers: [GuestController],
})
export class GuestModule {}
