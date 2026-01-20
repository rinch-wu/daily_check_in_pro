import { Module, forwardRef } from '@nestjs/common';
import { CheckInService } from './checkin.service';
import { CheckInController } from './checkin.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { IncentiveModule } from '../incentive/incentive.module';

@Module({
  imports: [PrismaModule, forwardRef(() => IncentiveModule)],
  controllers: [CheckInController],
  providers: [CheckInService],
  exports: [CheckInService],
})
export class CheckInModule {}