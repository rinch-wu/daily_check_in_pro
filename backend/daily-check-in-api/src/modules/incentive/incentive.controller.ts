import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { IncentiveService } from './incentive.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('incentive')
@UseGuards(JwtAuthGuard)
export class IncentiveController {
  constructor(private readonly incentiveService: IncentiveService) {}

  // 获取积分记录
  @Get('points/records')
  async getPointsRecords(@Request() req) {
    return this.incentiveService.getPointsRecords(req.user.userId);
  }

  // 获取勋章
  @Get('medals')
  async getMedals(@Request() req) {
    return this.incentiveService.getMedals(req.user.userId);
  }

  // 获取挑战列表
  @Get('challenges')
  async getChallenges() {
    return this.incentiveService.getChallenges();
  }

  // 参与挑战
  @Post('challenges/:id/join')
  async joinChallenge(@Request() req, @Param('id') id: string) {
    return this.incentiveService.joinChallenge(req.user.userId, id);
  }
}