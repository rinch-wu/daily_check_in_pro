import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SocialService } from './social.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { CommentDto } from './dto/comment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('social')
@UseGuards(JwtAuthGuard)
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  // ==================== 队伍相关 ====================

  // 创建队伍
  @Post('teams')
  async createTeam(@Request() req, @Body() createDto: CreateTeamDto) {
    return this.socialService.createTeam(req.user.userId, createDto);
  }

  // 获取队伍列表
  @Get('teams')
  async getTeams(@Request() req) {
    return this.socialService.getTeams(req.user.userId);
  }

  // 获取队伍详情
  @Get('teams/:id')
  async getTeam(@Param('id') id: string) {
    return this.socialService.getTeam(id);
  }

  // 加入队伍
  @Post('teams/:id/join')
  async joinTeam(@Request() req, @Param('id') id: string) {
    return this.socialService.joinTeam(req.user.userId, id);
  }

  // 退出队伍
  @Post('teams/:id/leave')
  async leaveTeam(@Request() req, @Param('id') id: string) {
    return this.socialService.leaveTeam(req.user.userId, id);
  }

  // ==================== 打卡圈相关 ====================

  // 发布动态
  @Post('posts')
  async createPost(@Request() req, @Body() createDto: CreatePostDto) {
    return this.socialService.createPost(req.user.userId, createDto);
  }

  // 获取动态列表
  @Get('posts')
  async getPosts(
    @Request() req,
    @Query('tag') tag?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.socialService.getPosts(
      req.user.userId,
      tag,
      parseInt(limit) || 10,
      parseInt(offset) || 0,
    );
  }

  // 点赞
  @Post('posts/:id/like')
  async likePost(@Request() req, @Param('id') id: string) {
    return this.socialService.likePost(req.user.userId, id);
  }

  // 评论
  @Post('posts/:id/comments')
  async commentPost(
    @Request() req,
    @Param('id') id: string,
    @Body() commentDto: CommentDto,
  ) {
    return this.socialService.commentPost(req.user.userId, id, commentDto);
  }

  // 获取评论列表
  @Get('posts/:id/comments')
  async getComments(@Param('id') id: string) {
    return this.socialService.getComments(id);
  }

  // ==================== 排行榜 ====================

  // 获取排行榜
  @Get('leaderboard')
  async getLeaderboard(@Request() req) {
    return this.socialService.getLeaderboard(req.user.userId);
  }
}