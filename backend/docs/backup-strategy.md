# 数据库备份策略

## 概述

- **数据库**: PostgreSQL (Supabase)
- **备份类型**: 自动备份 + 手动备份
- **备份工具**: pg_dump + Prisma

## 备份方案

### 1. 自动备份 (Supabase 自带)

Supabase 提供自动备份功能:
- **频率**: 每日自动备份
- **保留期**: 7天
- **恢复**: 通过 Supabase Dashboard 一键恢复

### 2. 手动备份脚本

创建 `scripts/backup.sh`:

```bash
#!/bin/bash
# 手动备份脚本

# 配置
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/gobang_backup_$DATE.sql"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
pg_dump "$DATABASE_URL" > $BACKUP_FILE

# 压缩
gzip $BACKUP_FILE

echo "Backup completed: $BACKUP_FILE.gz"
```

### 3. 数据导出脚本

创建 `scripts/export-data.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function exportData() {
  const data = {
    users: await prisma.user.findMany(),
    games: await prisma.game.findMany(),
    userStats: await prisma.userStats.findMany(),
    leaderboards: await prisma.leaderboard.findMany(),
  };

  fs.writeFileSync(
    `./backups/data_${Date.now()}.json`,
    JSON.stringify(data, null, 2)
  );

  console.log('Data export completed');
}

exportData();
```

### 4. 数据恢复脚本

创建 `scripts/restore.sh`:

```bash
#!/bin/bash
# 数据恢复脚本

if [ -z "$1" ]; then
  echo "Usage: ./restore.sh <backup_file>"
  exit 1
fi

BACKUP_FILE=$1

# 解压（如果是 gz 文件）
if [[ $BACKUP_FILE == *.gz ]]; then
  gunzip -c $BACKUP_FILE > temp_restore.sql
  BACKUP_FILE="temp_restore.sql"
fi

# 恢复数据
psql "$DATABASE_URL" < $BACKUP_FILE

# 清理
if [ -f "temp_restore.sql" ]; then
  rm temp_restore.sql
fi

echo "Restore completed"
```

## 备份保留策略

| 类型 | 频率 | 保留期 |
|------|------|--------|
| 自动备份 | 每日 | 7天 |
| 手动备份 | 按需 | 30天 |
| 版本发布备份 | 每次发布 | 永久 |

## 灾难恢复流程

1. **评估**: 确定数据丢失范围和时间点
2. **选择备份**: 选择最近的可用备份
3. **恢复**:
   ```bash
   # 停止应用
   # 恢复数据
   ./scripts/restore.sh backups/gobang_backup_20240101_000000.sql.gz
   # 验证数据完整性
   # 重启应用
   ```
4. **验证**: 检查关键数据完整性

## 监控

- 监控备份任务执行状态
- 定期检查备份文件完整性
- 设置备份失败告警
