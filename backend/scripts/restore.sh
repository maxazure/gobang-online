#!/bin/bash
# 数据库恢复脚本

set -e

if [ -z "$1" ]; then
  echo "Usage: ./restore.sh <backup_file>"
  echo "Example: ./restore.sh backups/gobang_backup_20240101_000000.sql.gz"
  exit 1
fi

BACKUP_FILE=$1

# 加载环境变量
if [ -f ".env" ]; then
  export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# 检查 DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL not set"
  exit 1
fi

# 确认
read -p "Warning: This will overwrite current database. Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Aborted"
  exit 1
fi

echo "Starting restore..."

# 解压（如果是 gz 文件）
if [[ $BACKUP_FILE == *.gz ]]; then
  echo "Decompressing..."
  gunzip -c "$BACKUP_FILE" > /tmp/temp_restore.sql
  BACKUP_FILE="/tmp/temp_restore.sql"
fi

# 恢复数据
psql "$DATABASE_URL" < "$BACKUP_FILE"

# 清理
if [ -f "/tmp/temp_restore.sql" ]; then
  rm /tmp/temp_restore.sql
fi

echo "Restore completed successfully"
