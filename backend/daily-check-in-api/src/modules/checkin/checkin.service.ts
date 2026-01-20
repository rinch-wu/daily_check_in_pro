import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCheckInItemDto } from './dto/create-checkin-item.dto';
import { UpdateCheckInItemDto } from './dto/update-checkin-item.dto';
import { SubmitCheckInDto } from './dto/submit-checkin.dto';
import { IncentiveService } from '../incentive/incentive.service';

@Injectable()
export class CheckInService {
  constructor(
    private prisma: PrismaService,
    private incentiveService: IncentiveService,
  ) {}

  // 创建打卡项
  async createItem(userId: string, createDto: CreateCheckInItemDto) {
    return this.prisma.checkInItem.create({
      data: {
        ...createDto,
        userId,
      },
    });
  }

  // 获取用户所有打卡项
  async getItems(userId: string) {
    return this.prisma.checkInItem.findMany({
      where: {
        userId,
        isHidden: false,
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  // 获取打卡项详情
  async getItem(itemId: string, userId: string) {
    const item = await this.prisma.checkInItem.findUnique({
      where: { id: itemId },
      include: { records: true },
    });

    if (!item) {
      throw new NotFoundException('打卡项不存在');
    }

    if (item.userId !== userId) {
      throw new ForbiddenException('无权访问');
    }

    return item;
  }

  // 更新打卡项
  async updateItem(itemId: string, userId: string, updateDto: UpdateCheckInItemDto) {
    const item = await this.prisma.checkInItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('打卡项不存在');
    }

    if (item.userId !== userId) {
      throw new ForbiddenException('无权修改');
    }

    return this.prisma.checkInItem.update({
      where: { id: itemId },
      data: updateDto,
    });
  }

  // 删除打卡项
  async deleteItem(itemId: string, userId: string) {
    const item = await this.prisma.checkInItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('打卡项不存在');
    }

    if (item.userId !== userId) {
      throw new ForbiddenException('无权删除');
    }

    await this.prisma.checkInItem.delete({
      where: { id: itemId },
    });

    return { message: '删除成功' };
  }

  // 提交打卡
  async submitCheckIn(userId: string, itemId: string, submitDto: SubmitCheckInDto) {
    // 检查打卡项
    const item = await this.prisma.checkInItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('打卡项不存在');
    }

    if (item.userId !== userId) {
      throw new ForbiddenException('无权打卡');
    }

    // 检查今日是否已打卡
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.checkInRecord.findUnique({
      where: {
        userId_itemId_date: {
          userId,
          itemId,
          date: today,
        },
      },
    });

    if (existing) {
      throw new ForbiddenException('今日已打卡');
    }

    // 创建打卡记录
    const record = await this.prisma.checkInRecord.create({
      data: {
        userId,
        itemId,
        note: submitDto.note || null,
        status: 'normal',
      },
    });

    // 奖励积分
    await this.incentiveService.addPoints(userId, 5, 'normal', '打卡成功');

    return record;
  }

  // 补签
  async makeupCheckIn(userId: string, itemId: string, date: Date) {
    const item = await this.prisma.checkInItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('打卡项不存在');
    }

    if (item.userId !== userId) {
      throw new ForbiddenException('无权操作');
    }

    // 检查用户积分
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.points < 10) {
      throw new ForbiddenException('积分不足，补签需要10积分');
    }

    // 检查是否已有记录
    const existing = await this.prisma.checkInRecord.findUnique({
      where: {
        userId_itemId_date: {
          userId,
          itemId,
          date,
        },
      },
    });

    if (existing) {
      throw new ForbiddenException('该日期已有记录');
    }

    // 创建补签记录
    const record = await this.prisma.checkInRecord.create({
      data: {
        userId,
        itemId,
        date,
        status: 'makeup',
        makeupCost: 10,
      },
    });

    // 扣除积分
    await this.incentiveService.deductPoints(userId, 10, 'makeup', '补签');

    return record;
  }

  // 获取打卡记录
  async getRecords(userId: string, itemId?: string) {
    const where: any = { userId };
    if (itemId) {
      where.itemId = itemId;
    }

    return this.prisma.checkInRecord.findMany({
      where,
      include: { item: true },
      orderBy: { date: 'desc' },
    });
  }

  // 获取打卡统计
  async getStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        checkinItems: true,
        checkinRecords: true,
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const totalItems = user.checkinItems.length;
    const totalRecords = user.checkinRecords.length;
    const todayRecords = user.checkinRecords.filter(
      (r) => r.date.toDateString() === new Date().toDateString(),
    ).length;

    return {
      totalItems,
      totalRecords,
      todayRecords,
      points: user.points,
    };
  }
}