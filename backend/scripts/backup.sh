#!/bin/bash
# 数据库手动备份脚本

set -e

# 配置
BACKUP_DIR="$(dirname "$0")/../backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/gobang_backup_$DATE.sql"

# 加载环境变量
if [ -f ".env" ]; then
  export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# 检查 DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL not set"
  exit 1
fi

# 创建备份目录
mkdir -p "$BACKUP_DIR"

echo "Starting backup..."

# 执行备份
pg_dump "$DATABASE_URL" > "$BACKUP_FILE"

# 压缩
gzip "$BACKUP_FILE"

echo "Backup completed: $BACKUP_FILE.gz"
echo "File size: $(du -h "$BACKUP_FILE.gz" | cut -f1)"

# 清理旧备份 (保留30天)
find "$BACKUP_DIR" -name "gobang_backup_*.sql.gz" -mtime +30 -delete

echo "Old backups cleaned"
