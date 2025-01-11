#! /bin/bash

CONTAINER_NAME="mermaid-chatgpt-editor-postgresql"
DB_NAME="xl_db"
DB_USER="postgres"

BACKUP_ROOT_DIR_PATH="$(git rev-parse --show-toplevel)/"
BACKUP_DATA_DIR_PATH="${BACKUP_ROOT_DIR_PATH}.xdevkit/backup/data/"
LATEST_BACKUP_DATA_DIR_PATH="${BACKUP_DATA_DIR_PATH}latest/"
LOG_DIR_PATH="${BACKUP_ROOT_DIR_PATH}log/"
mkdir -p $LOG_DIR_PATH

# 最新のバックアップでリストア。引数でold/内のファイル等を指定可能。
BACKUP_FILE_PREFIX="backup_${CONTAINER_NAME}_${DB_NAME}_"
_RESTORE_FILE_PATH=${1:-$(ls ${LATEST_BACKUP_DATA_DIR_PATH}${BACKUP_FILE_PREFIX}*)}
RESTORE_FILE_PATH=$(realpath $_RESTORE_FILE_PATH)

LOG_FILE_PATH="${LOG_DIR_PATH}restore.log"

echo "restore: ${RESTORE_FILE_PATH}"

# リストア
docker cp ${RESTORE_FILE_PATH} ${CONTAINER_NAME}:/tmp/backup.sql
docker exec -it ${CONTAINER_NAME} pg_restore -U ${DB_USER} --clean -d ${DB_NAME} /tmp/backup.sql
docker exec -it ${CONTAINER_NAME} rm /tmp/backup.sql

echo "=============== $(date +%Y/%m/%d-%H:%M:%S) ===============" >> $LOG_FILE_PATH
echo "restore: ${RESTORE_FILE_PATH}" >> $LOG_FILE_PATH
echo "log file: ${LOG_FILE_PATH}"
