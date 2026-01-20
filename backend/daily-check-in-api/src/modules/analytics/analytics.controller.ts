import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // 获取用户统计
  @Get('user')
  async getUserStats(@Request() req) {
    return this.analyticsService.getUserStats(req.user.userId);
  }

  // 获取打卡趋势
  @Get('trend')
  async getTrend(
    @Request() req,
    @Query('days') days?: string,
  ) {
    return this.analyticsService.getCheckInTrend(
      req.user.userId,
      parseInt(days) || 30,
    );
  }

  // 获取月度报告
  @Get('report')
  async getMonthlyReport(
    @Request() req,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    const now = new Date();
    return this.analyticsService.getMonthlyReport(
      req.user.userId,
      parseInt(year) || now.getFullYear(),
      parseInt(month) || now.getMonth() + 1,
    );
  }
}