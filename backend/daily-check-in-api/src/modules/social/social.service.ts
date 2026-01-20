import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { CommentDto } from './dto/comment.dto';

@Injectable()
export class SocialService {
  constructor(private prisma: PrismaService) {}

  // ==================== 队伍相关 ====================

  // 创建队伍
  async createTeam(userId: string, createDto: CreateTeamDto) {
    return this.prisma.team.create({
      data: {
        userId,
        ...createDto,
        status: 'active',
      },
    });
  }

  // 获取队伍列表
  async getTeams(userId: string) {
    // 获取我创建的队伍
    const myTeams = await this.prisma.team.findMany({
      where: { userId },
      include: {
        captain: { select: { id: true, nickname: true, avatar: true } },
        members: {
          include: { user: { select: { id: true, nickname: true, avatar: true } } },
        },
      },
    });

    // 获取我加入的队伍
    const joinedTeams = await this.prisma.team.findMany({
      where: {
        members: { some: { userId } },
        userId: { not: userId },
      },
      include: {
        captain: { select: { id: true, nickname: true, avatar: true } },
        members: {
          include: { user: { select: { id: true, nickname: true, avatar: true } } },
        },
      },
    });

    return { myTeams, joinedTeams };
  }

  // 获取队伍详情
  async getTeam(teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        captain: { select: { id: true, nickname: true, avatar: true } },
        members: {
          include: { user: { select: { id: true, nickname: true, avatar: true } } },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('队伍不存在');
    }

    return team;
  }

  // 加入队伍
  async joinTeam(userId: string, teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('队伍不存在');
    }

    if (team.status !== 'active') {
      throw new ForbiddenException('队伍已解散');
    }

    // 检查是否已加入
    const existing = await this.prisma.teamMember.findFirst({
      where: { teamId, userId },
    });

    if (existing) {
      throw new ForbiddenException('已在队伍中');
    }

    // 检查人数限制
    const memberCount = await this.prisma.teamMember.count({
      where: { teamId },
    });

    if (memberCount >= team.maxMembers) {
      throw new ForbiddenException('队伍已满');
    }

    return this.prisma.teamMember.create({
      data: { teamId, userId, role: 'member' },
    });
  }

  // 退出队伍
  async leaveTeam(userId: string, teamId: string) {
    const member = await this.prisma.teamMember.findFirst({
      where: { teamId, userId },
    });

    if (!member) {
      throw new NotFoundException('未加入该队伍');
    }

    // 队长不能退出，只能解散
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (team.userId === userId) {
      throw new ForbiddenException('队长不能退出队伍');
    }

    await this.prisma.teamMember.delete({
      where: { id: member.id },
    });

    return { message: '已退出队伍' };
  }

  // ==================== 打卡圈相关 ====================

  // 发布动态
  async createPost(userId: string, createDto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        userId,
        ...createDto,
      },
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
      },
    });
  }

  // 获取动态列表
  async getPosts(userId?: string, tag?: string, limit = 10, offset = 0) {
    const where: any = {};

    if (tag) {
      where.tags = { contains: tag };
    }

    const posts = await this.prisma.post.findMany({
      where,
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
        comments: {
          include: { user: { select: { id: true, nickname: true, avatar: true } } },
          take: 3,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // 如果提供了userId，标记是否已点赞
    if (userId) {
      const likedPostIds = await this.prisma.like.findMany({
        where: { userId },
        select: { postId: true },
      });

      const likedIds = new Set(likedPostIds.map((l) => l.postId));

      return posts.map((post) => ({
        ...post,
        isLiked: likedIds.has(post.id),
      }));
    }

    return posts;
  }

  // 点赞
  async likePost(userId: string, postId: string) {
    // 检查是否已点赞
    const existing = await this.prisma.like.findFirst({
      where: { userId, postId },
    });

    if (existing) {
      // 取消点赞
      await this.prisma.like.delete({ where: { id: existing.id } });
      await this.prisma.post.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
      });
      return { isLiked: false };
    }

    // 点赞
    await this.prisma.like.create({
      data: { userId, postId },
    });
    await this.prisma.post.update({
      where: { id: postId },
      data: { likeCount: { increment: 1 } },
    });

    return { isLiked: true };
  }

  // 评论
  async commentPost(userId: string, postId: string, commentDto: CommentDto) {
    return this.prisma.comment.create({
      data: {
        userId,
        postId,
        content: commentDto.content,
      },
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
      },
    });
  }

  // 获取评论列表
  async getComments(postId: string) {
    return this.prisma.comment.findMany({
      where: { postId },
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==================== 排行榜 ====================

  // 获取好友排行榜 (基于连续打卡天数)
  async getLeaderboard(userId: string) {
    // 这里简化实现，实际可以基于打卡数据计算连续天数
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        nickname: true,
        avatar: true,
        points: true,
        checkinRecords: {
          select: { id: true, createdAt: true },
        },
      },
      orderBy: { points: 'desc' },
      take: 10,
    });

    return users.map((u, index) => ({
      rank: index + 1,
      ...u,
      totalCheckIns: u.checkinRecords.length,
    }));
  }
}