import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('notification')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // 获取通知列表
  @Get()
  async getNotifications(
    @Request() req,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notificationService.getNotifications(
      req.user.userId,
      unreadOnly === 'true',
    );
  }

  // 获取未读数量
  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    return this.notificationService.getUnreadCount(req.user.userId);
  }

  // 标记已读
  @Put(':id/read')
  async markAsRead(@Request() req, @Param('id') id: string) {
    return this.notificationService.markAsRead(req.user.userId, id);
  }

  // 全部标记已读
  @Put('read-all')
  async markAllAsRead(@Request() req) {
    return this.notificationService.markAllAsRead(req.user.userId);
  }

  // 清空通知
  @Delete()
  async clearNotifications(@Request() req) {
    return this.notificationService.clearNotifications(req.user.userId);
  }
}