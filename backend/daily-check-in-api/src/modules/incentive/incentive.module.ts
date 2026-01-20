import { Module } from '@nestjs/common';
import { IncentiveService } from './incentive.service';
import { IncentiveController } from './incentive.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IncentiveController],
  providers: [IncentiveService],
  exports: [IncentiveService],
})
export class IncentiveModule {}