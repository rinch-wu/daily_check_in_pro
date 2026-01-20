import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as https from 'https';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // 微信登录
  async login(loginDto: LoginDto) {
    const { code, nickname, avatar } = loginDto;

    // 调用微信接口获取openid
    const openid = await this.getWechatOpenid(code);

    // 查找或创建用户
    let user = await this.prisma.user.findUnique({
      where: { openid },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          openid,
          nickname: nickname || '微信用户',
          avatar: avatar || 'https://via.placeholder.com/100',
        },
      });
    } else if (nickname || avatar) {
      // 更新用户信息
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          ...(nickname && { nickname }),
          ...(avatar && { avatar }),
        },
      });
    }

    // 生成JWT token
    const token = this.jwtService.sign({
      userId: user.id,
      openid: user.openid,
    });

    return {
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        points: user.points,
      },
    };
  }

  // 获取用户信息
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        avatar: true,
        points: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  // 更新用户信息
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateProfileDto,
      select: {
        id: true,
        nickname: true,
        avatar: true,
        points: true,
      },
    });

    return user;
  }

  // 获取微信openid
  private async getWechatOpenid(code: string): Promise<string> {
    const appId = process.env.WECHAT_APPID;
    const appSecret = process.env.WECHAT_SECRET;

    return new Promise((resolve, reject) => {
      const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;

      https
        .get(url, (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              if (response.errcode) {
                reject(new UnauthorizedException('微信登录失败'));
              } else {
                resolve(response.openid);
              }
            } catch (error) {
              reject(new UnauthorizedException('微信登录失败'));
            }
          });
        })
        .on('error', (error) => {
          reject(new UnauthorizedException('微信登录失败'));
        });
    });
  }
}