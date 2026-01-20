import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class IncentiveService {
  constructor(private prisma: PrismaService) {}

  // 添加积分
  async addPoints(
    userId: string,
    amount: number,
    type: string,
    reason: string,
    relatedId?: string,
  ) {
    // 创建积分记录
    await this.prisma.pointsRecord.create({
      data: {
        userId,
        type,
        amount,
        reason,
        relatedId,
      },
    });

    // 更新用户积分
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        points: { increment: amount },
      },
    });
  }

  // 扣除积分
  async deductPoints(
    userId: string,
    amount: number,
    type: string,
    reason: string,
    relatedId?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.points < amount) {
      throw new Error('积分不足');
    }

    // 创建积分记录
    await this.prisma.pointsRecord.create({
      data: {
        userId,
        type,
        amount: -amount,
        reason,
        relatedId,
      },
    });

    // 更新用户积分
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        points: { decrement: amount },
      },
    });
  }

  // 获取积分记录
  async getPointsRecords(userId: string) {
    return this.prisma.pointsRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 获取勋章
  async getMedals(userId: string) {
    const userMedals = await this.prisma.userMedal.findMany({
      where: { userId },
      include: { medal: true },
      orderBy: { earnedAt: 'desc' },
    });

    return userMedals.map((um) => ({
      id: um.medal.id,
      name: um.medal.name,
      description: um.medal.description,
      icon: um.medal.icon,
      rarity: um.medal.rarity,
      earnedAt: um.earnedAt,
    }));
  }

  // 检查并颁发勋章
  async checkAndAwardMedal(userId: string, condition: string): Promise<boolean> {
    const medal = await this.prisma.medal.findFirst({
      where: { condition },
    });

    if (!medal) {
      return false;
    }

    // 检查是否已获得该勋章
    const existing = await this.prisma.userMedal.findFirst({
      where: {
        userId,
        medalId: medal.id,
      },
    });

    if (existing) {
      return false;
    }

    // 颁发勋章
    await this.prisma.userMedal.create({
      data: {
        userId,
        medalId: medal.id,
      },
    });

    return true;
  }

  // 获取挑战列表
  async getChallenges() {
    return this.prisma.challenge.findMany({
      where: { status: { in: ['upcoming', 'ongoing'] } },
      orderBy: { startDate: 'asc' },
    });
  }

  // 参与挑战
  async joinChallenge(userId: string, challengeId: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new Error('挑战不存在');
    }

    // 增加参与人数
    return this.prisma.challenge.update({
      where: { id: challengeId },
      data: {
        participants: { increment: 1 },
      },
    });
  }
}