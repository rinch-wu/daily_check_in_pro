import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  // 获取通知列表
  async getNotifications(userId: string, unreadOnly = false) {
    const where: any = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  // 标记通知已读
  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('通知不存在');
    }

    if (notification.userId !== userId) {
      throw new Error('无权操作');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  // 全部标记已读
  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { message: '全部标记已读' };
  }

  // 清空通知
  async clearNotifications(userId: string) {
    await this.prisma.notification.deleteMany({
      where: { userId },
    });

    return { message: '清空成功' };
  }

  // 创建通知
  async createNotification(
    userId: string,
    type: string,
    title: string,
    content: string,
    relatedId?: string,
  ) {
    return this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        content,
        relatedId,
      },
    });
  }

  // 获取未读数量
  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    return { count };
  }
}