import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  // 获取用户统计
  async getUserStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        checkinItems: true,
        checkinRecords: true,
        userMedals: { include: { medal: true } },
        pointsRecords: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    // 计算今日打卡数
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayRecords = user.checkinRecords.filter(
      (r) => r.date >= today && r.date < tomorrow,
    ).length;

    // 计算连续打卡天数
    const consecutiveDays = this.calculateConsecutiveDays(user.checkinRecords);

    // 计算打卡完成率
    const totalExpected = user.checkinItems.length * 30; // 假设30天
    const completionRate =
      totalExpected > 0 ? (user.checkinRecords.length / totalExpected) * 100 : 0;

    return {
      totalItems: user.checkinItems.length,
      totalRecords: user.checkinRecords.length,
      todayRecords,
      consecutiveDays,
      completionRate: Math.round(completionRate * 100) / 100,
      points: user.points,
      medals: user.userMedals.length,
      recentPointsRecords: user.pointsRecords,
    };
  }

  // 获取打卡趋势
  async getCheckInTrend(userId: string, days = 30) {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    const records = await this.prisma.checkInRecord.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });

    // 按日期分组统计
    const trend: { date: string; count: number }[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const count = records.filter(
        (r) => r.date.toISOString().split('T')[0] === dateStr,
      ).length;

      trend.push({ date: dateStr, count });
    }

    return trend;
  }

  // 生成月度报告
  async getMonthlyReport(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const records = await this.prisma.checkInRecord.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      include: { item: true },
    });

    // 按打卡项统计
    const itemStats = records.reduce((acc, record) => {
      const itemId = record.itemId;
      const itemName = record.item.name;
      if (!acc[itemId]) {
        acc[itemId] = { itemId, itemName, count: 0 };
      }
      acc[itemId].count++;
      return acc;
    }, {} as Record<string, { itemId: string; itemName: string; count: number }>);

    return {
      year,
      month,
      totalRecords: records.length,
      itemStats: Object.values(itemStats),
    };
  }

  // 计算连续打卡天数
  private calculateConsecutiveDays(records: any[]): number {
    if (records.length === 0) return 0;

    // 按日期降序排列
    const sortedDates = records
      .map((r) => r.date)
      .sort((a, b) => b.getTime() - a.getTime());

    let consecutiveDays = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const date of sortedDates) {
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (currentDate.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 0 || diffDays === consecutiveDays) {
        consecutiveDays++;
        currentDate = checkDate;
      } else if (diffDays > consecutiveDays) {
        break;
      }
    }

    return consecutiveDays;
  }
}