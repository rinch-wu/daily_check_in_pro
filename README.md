# 每日打卡 Pro (Daily Check-in Pro)

一款基于微信小程序的每日打卡应用，帮助用户培养良好习惯，通过积分、勋章、排行榜等激励机制，让坚持变得更有趣。

A daily check-in mini-program based on WeChat, helping users build good habits. With incentives like points, medals, and leaderboards, sticking to your goals becomes fun.

## 项目简介 / Project Overview

| 特性 | 说明 |
|------|------|
| **打卡管理** | 创建自定义打卡项目，每日提交打卡记录，支持补签功能 |
| **积分系统** | 每次打卡获得积分，积分可用于补签和兑换奖励 |
| **勋章收集** | 解稀有成就徽章，展示个人里程碑 |
| **社交互动** | 创建或加入团队，发布动态，点赞评论，查看排行榜 |
| **数据统计** | 可视化打卡数据，追踪个人成长轨迹 |
| **消息通知** | 打卡提醒、团队动态、系统通知 |

---

## 技术栈 / Tech Stack

### 后端 / Backend
- **框架**: NestJS (Node.js)
- **语言**: TypeScript
- **数据库**: MySQL
- **ORM**: Prisma
- **认证**: JWT
- **API**: RESTful

### 前端 / Frontend
- **框架**: uni-app (Vue 3)
- **语言**: TypeScript
- **状态管理**: Pinia + pinia-plugin-persistedstate
- **构建工具**: Vite

---

## 项目结构 / Project Structure

```
daily_check_in_pro/
├── backend/                          # 后端项目
│   └── daily-check-in-api/
│       ├── prisma/                  # Prisma 配置和迁移
│       │   ├── schema.prisma        # 数据库模型定义
│       │   └── migrations/          # 数据库迁移文件
│       ├── src/
│       │   ├── modules/             # 功能模块
│       │   │   ├── user/            # 用户模块（登录、个人信息）
│       │   │   ├── checkin/         # 打卡模块
│       │   │   ├── social/          # 社交模块（团队、动态）
│       │   │   ├── incentive/       # 激励模块（积分、勋章）
│       │   │   ├── notification/    # 通知模块
│       │   │   └── analytics/       # 统计分析模块
│       │   ├── prisma/              # Prisma 服务
│       │   ├── common/              # 公共模块（守卫、装饰器）
│       │   └── main.ts              # 应用入口
│       ├── .env.example             # 环境变量示例
│       └── package.json
├── frontend/                         # 前端项目
│   └── daily-check-in-app/
│       ├── src/
│       │   ├── pages/               # 页面
│       │   │   ├── index/           # 打卡列表页
│       │   │   ├── community/       # 社区动态页
│       │   │   ├── team/            # 团队页
│       │   │   ├── mine/            # 个人中心页
│       │   │   ├── login/           # 登录页
│       │   │   ├── checkin/         # 打卡详情页
│       │   │   └── incentive/       # 积分勋章页
│       │   ├── stores/              # 状态管理
│       │   ├── utils/               # 工具函数
│       │   └── main.ts              # 应用入口
│       ├── .env.example             # 环境变量示例
│       ├── pages.json               # 页面配置
│       └── package.json
└── docs/                            # 项目文档
    ├── 每日打卡Pro-PRD.md
    ├── 技术选型方案.md
    ├── 模块设计方案.md
    ├── UI设计方案.md
    ├── 启动流程.md
    └── 测试流程.md
```

---

## 数据库模型 / Database Models

### 核心模型 / Core Models

| 模型 | 说明 |
|------|------|
| `User` | 用户信息 |
| `CheckInItem` | 打卡项目 |
| `CheckInRecord` | 打卡记录 |
| `Team` | 团队信息 |
| `Post` | 动态发布 |
| `Comment` | 评论内容 |
| `Like` | 点赞记录 |
| `PointsRecord` | 积分记录 |
| `Medal` | 勋章定义 |
| `UserMedal` | 用户获得勋章 |
| `Achievement` | 成就定义 |
| `Challenge` | 挑战任务 |
| `Notification` | 系统通知 |

---

## API 接口 / API Endpoints

### 用户模块 / User
- `POST /auth/login` - 微信登录
- `GET /user/profile` - 获取个人信息
- `PUT /user/profile` - 更新个人信息

### 打卡模块 / Check-in
- `GET /checkin/items` - 获取打卡项目列表
- `POST /checkin/items` - 创建打卡项目
- `PUT /checkin/items/:id` - 更新打卡项目
- `DELETE /checkin/items/:id` - 删除打卡项目
- `POST /checkin/:itemId/submit` - 提交打卡
- `POST /checkin/:itemId/makeup` - 补签

### 社交模块 / Social
- `GET /social/posts` - 获取动态列表
- `POST /social/posts` - 发布动态
- `POST /social/posts/:id/like` - 点赞动态
- `POST /social/posts/:id/comment` - 评论动态
- `GET /social/teams` - 获取团队列表
- `POST /social/teams` - 创建团队
- `GET /social/leaderboard` - 获取排行榜

### 激励模块 / Incentive
- `GET /incentive/points` - 获取积分信息
- `GET /incentive/points/records` - 获取积分记录
- `GET /incentive/medals` - 获取勋章列表
- `GET /incentive/challenges` - 获取挑战任务

---

## 功能特性 / Features

1. **微信一键登录**: 使用微信授权快速登录
2. **自定义打卡项目**: 支持创建个性化的打卡项目（运动、学习、读书等）
3. **积分获取与消耗**: 打卡赚积分，积分可补签
4. **勋章系统**: 连续打卡、累计次数等多维度成就解锁
5. **团队协作**: 创建或加入团队，与好友一起坚持
6. **社区动态**: 分享打卡心得，互动交流
7. **排行榜**: 查看团队和个人积分排名
8. **数据统计**: 可视化展示打卡数据和趋势
9. **消息提醒**: 打卡提醒、团队互动通知

---

## 后续规划 / Future Plans

- [ ] 打卡日历视图
- [ ] 积分商城（兑换实物奖励）
- [ ] 打卡分享海报
- [ ] 挑战赛活动
- [ ] 数据导出功能
- [ ] 深色模式支持

---

## 许可证 / License

MIT License
