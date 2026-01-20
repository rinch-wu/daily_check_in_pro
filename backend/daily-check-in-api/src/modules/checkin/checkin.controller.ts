import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CheckInService } from './checkin.service';
import { CreateCheckInItemDto } from './dto/create-checkin-item.dto';
import { UpdateCheckInItemDto } from './dto/update-checkin-item.dto';
import { SubmitCheckInDto } from './dto/submit-checkin.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('checkin')
@UseGuards(JwtAuthGuard)
export class CheckInController {
  constructor(private readonly checkinService: CheckInService) {}

  // 创建打卡项
  @Post('items')
  async createItem(@Request() req, @Body() createDto: CreateCheckInItemDto) {
    return this.checkinService.createItem(req.user.userId, createDto);
  }

  // 获取打卡项列表
  @Get('items')
  async getItems(@Request() req) {
    return this.checkinService.getItems(req.user.userId);
  }

  // 获取打卡项详情
  @Get('items/:id')
  async getItem(@Request() req, @Param('id') id: string) {
    return this.checkinService.getItem(id, req.user.userId);
  }

  // 更新打卡项
  @Put('items/:id')
  async updateItem(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateCheckInItemDto,
  ) {
    return this.checkinService.updateItem(id, req.user.userId, updateDto);
  }

  // 删除打卡项
  @Delete('items/:id')
  async deleteItem(@Request() req, @Param('id') id: string) {
    return this.checkinService.deleteItem(id, req.user.userId);
  }

  // 提交打卡
  @Post('records')
  async submitCheckIn(
    @Request() req,
    @Body() submitDto: SubmitCheckInDto,
    @Query('itemId') itemId: string,
  ) {
    return this.checkinService.submitCheckIn(req.user.userId, itemId, submitDto);
  }

  // 补签
  @Post('records/makeup')
  async makeupCheckIn(
    @Request() req,
    @Query('itemId') itemId: string,
    @Query('date') date: string,
  ) {
    return this.checkinService.makeupCheckIn(
      req.user.userId,
      itemId,
      new Date(date),
    );
  }

  // 获取打卡记录
  @Get('records')
  async getRecords(@Request() req, @Query('itemId') itemId?: string) {
    return this.checkinService.getRecords(req.user.userId, itemId);
  }

  // 获取打卡统计
  @Get('stats')
  async getStats(@Request() req) {
    return this.checkinService.getStats(req.user.userId);
  }
}