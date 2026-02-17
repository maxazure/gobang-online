# 五子棋在线对战平台 - 数据库设计文档

## 概述

- **数据库**: PostgreSQL 14+
- **ORM**: Prisma
- **迁移工具**: Prisma Migrate

## 数据库模型

### 1. 用户表 (users)

存储用户基本信息和认证数据。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String | PK, CUID | 用户唯一标识 |
| email | String | Unique, Indexed | 邮箱地址 |
| password_hash | String | Not Null | 密码哈希(BCrypt) |
| display_name | String | Not Null | 显示名称 |
| avatar_url | String | Nullable | 头像URL |
| rating | Int | Default: 1200, Indexed | ELO等级分 |
| tier | Enum | Default: BRONZE, Indexed | 段位 |
| is_verified | Boolean | Default: false | 邮箱是否验证 |
| is_active | Boolean | Default: true | 账户是否激活 |
| created_at | DateTime | Default: now() | 创建时间 |
| updated_at | DateTime | Auto Update | 更新时间 |
| last_login_at | DateTime | Nullable | 最后登录时间 |

**索引**: email, rating, tier

---

### 2. 游戏记录表 (games)

存储所有对局记录和走棋数据。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String | PK, CUID | 游戏唯一标识 |
| black_player_id | String | FK → users.id, Indexed | 黑方玩家ID |
| white_player_id | String | FK → users.id, Indexed | 白方玩家ID |
| winner_id | String | FK → users.id, Nullable, Indexed | 获胜者ID |
| moves | Json | Not Null | 走棋记录JSON数组 |
| board_size | Int | Default: 15 | 棋盘大小 |
| game_mode | Enum | Default: CASUAL, Indexed | 游戏模式 |
| time_control | Int | Nullable | 每步时间限制(秒) |
| status | Enum | Default: ONGOING, Indexed | 游戏状态 |
| result | Enum | Nullable | 游戏结果 |
| created_at | DateTime | Default: now(), Indexed | 创建时间 |
| ended_at | DateTime | Nullable | 结束时间 |

**索引**: black_player_id, white_player_id, winner_id, created_at, game_mode, status

---

### 3. 好友关系表 (friendships)

管理用户间的好友关系。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String | PK, CUID | 关系唯一标识 |
| user_id | String | FK → users.id, Indexed | 发起者ID |
| friend_id | String | FK → users.id, Indexed | 好友ID |
| status | Enum | Default: PENDING, Indexed | 关系状态 |
| created_at | DateTime | Default: now() | 创建时间 |
| updated_at | DateTime | Auto Update | 更新时间 |

**约束**: Unique(user_id, friend_id)
**索引**: user_id, friend_id, status

---

### 4. 聊天消息表 (chat_messages)

存储大厅和房间聊天消息。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String | PK, CUID | 消息唯一标识 |
| room_id | String | Indexed | 房间ID("lobby"或具体ID) |
| user_id | String | FK → users.id, Indexed | 发送者ID |
| content | String | Not Null | 消息内容 |
| message_type | Enum | Default: TEXT | 消息类型 |
| created_at | DateTime | Default: now(), Indexed | 创建时间 |

**索引**: room_id, user_id, created_at

---

### 5. 排行榜表 (leaderboards)

按赛季存储用户排名数据。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String | PK, CUID | 记录唯一标识 |
| user_id | String | FK → users.id, Unique, Indexed | 用户ID |
| season_id | String | Indexed | 赛季ID |
| rating | Int | Default: 1200, Indexed | 赛季等级分 |
| wins | Int | Default: 0 | 胜场数 |
| losses | Int | Default: 0 | 负场数 |
| draws | Int | Default: 0 | 平局数 |
| rank | Int | Nullable, Indexed | 排名 |
| created_at | DateTime | Default: now() | 创建时间 |
| updated_at | DateTime | Auto Update | 更新时间 |

**约束**: Unique(user_id, season_id)
**索引**: season_id, rating, rank

---

### 6. 用户统计表 (user_stats)

存储用户详细战绩统计。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String | PK, CUID | 统计唯一标识 |
| user_id | String | FK → users.id, Unique, Indexed | 用户ID |
| total_games | Int | Default: 0, Indexed | 总对局数 |
| wins | Int | Default: 0, Indexed | 胜场数 |
| losses | Int | Default: 0 | 负场数 |
| draws | Int | Default: 0 | 平局数 |
| win_streak | Int | Default: 0 | 当前连胜 |
| max_win_streak | Int | Default: 0 | 最大连胜 |
| mode_stats | Json | Nullable | 各模式统计 |
| black_games | Int | Default: 0 | 执黑局数 |
| black_wins | Int | Default: 0 | 执黑胜场 |
| white_games | Int | Default: 0 | 执白局数 |
| white_wins | Int | Default: 0 | 执白胜场 |
| created_at | DateTime | Default: now() | 创建时间 |
| updated_at | DateTime | Auto Update | 更新时间 |

**索引**: user_id, totalGames, wins

---

### 7. 房间表 (rooms) - 扩展

存储游戏房间信息。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String | PK, CUID | 房间唯一标识 |
| host_id | String | Indexed | 房主ID |
| name | String | Nullable | 房间名称 |
| is_public | Boolean | Default: true, Indexed | 是否公开 |
| password | String | Nullable | 房间密码 |
| max_players | Int | Default: 2 | 最大玩家数 |
| game_mode | Enum | Default: CASUAL | 游戏模式 |
| time_control | Int | Nullable | 时间控制 |
| status | Enum | Default: WAITING, Indexed | 房间状态 |
| players | Json | Nullable | 玩家列表 |
| spectators | Json | Nullable | 观战者列表 |
| game_id | String | Unique, Nullable | 关联游戏ID |
| created_at | DateTime | Default: now() | 创建时间 |
| updated_at | DateTime | Auto Update | 更新时间 |

**索引**: host_id, status, is_public

---

### 8. 赛季表 (seasons) - 扩展

管理排位赛赛季。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String | PK, CUID | 赛季唯一标识 |
| name | String | Not Null | 赛季名称 |
| description | String | Nullable | 赛季描述 |
| start_date | DateTime | Not Null, Indexed | 开始日期 |
| end_date | DateTime | Not Null | 结束日期 |
| is_active | Boolean | Default: true, Indexed | 是否当前赛季 |
| created_at | DateTime | Default: now() | 创建时间 |

**索引**: is_active, start_date

## 枚举类型

### Tier (段位)
- BRONZE (青铜)
- SILVER (白银)
- GOLD (黄金)
- PLATINUM (铂金)
- DIAMOND (钻石)
- MASTER (大师)
- GRANDMASTER (宗师)

### GameMode (游戏模式)
- CASUAL (休闲)
- RANKED (排位)
- AI_BATTLE (AI对战)
- PRIVATE (私人房间)

### GameStatus (游戏状态)
- ONGOING (进行中)
- COMPLETED (已完成)
- ABORTED (中止)
- TIMEOUT (超时)

### GameResult (游戏结果)
- BLACK_WIN (黑胜)
- WHITE_WIN (白胜)
- DRAW (平局)

### FriendshipStatus (好友状态)
- PENDING (待接受)
- ACCEPTED (已接受)
- BLOCKED (已屏蔽)

### MessageType (消息类型)
- TEXT (文本)
- SYSTEM (系统)
- EMOTE (表情)

### RoomStatus (房间状态)
- WAITING (等待中)
- PLAYING (游戏中)
- CLOSED (已关闭)

## 关系图

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    users    │────<│    games    │>────│    users    │
│  (black)    │     │             │     │  (white)    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │             ┌─────┴─────┐             │
       │             │  winner   │             │
       │             └─────┬─────┘             │
       │                   │                   │
       │                   ▼                   │
       │            ┌─────────────┐            │
       │            │    users    │            │
       │            │   (winner)  │            │
       │            └─────────────┘            │
       │                                       │
       ├──< friendships >──────────────────────┤
       │                                       │
       ├──< user_stats >───────────────────────┤
       │                                       │
       ├──< leaderboard >──────────────────────┤
       │                                       │
       └──< chat_messages >────────────────────┘
```

## 索引策略

1. **主键索引**: 所有表使用 CUID 作为主键
2. **唯一索引**: email, user_id + friend_id, user_id + season_id
3. **外键索引**: 所有外键字段自动创建索引
4. **查询优化索引**:
   - users: rating, tier (排行榜查询)
   - games: created_at, game_mode, status (游戏列表)
   - leaderboards: rating, rank (排序)
   - chat_messages: room_id + created_at (聊天记录)

## 备份策略

详见 backup-strategy.md

## 使用说明

```bash
# 生成 Prisma Client
pnpm db:generate

# 创建迁移
pnpm db:migrate

# 应用迁移到生产环境
pnpm db:deploy

# 打开 Prisma Studio
pnpm db:studio

# 执行种子数据
pnpm db:seed
```
