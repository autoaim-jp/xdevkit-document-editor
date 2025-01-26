#!/bin/bash

CONTAINER_NAME="mermaid-chatgpt-editor-postgresql"
DB_NAME="xl_db"

GIT_ROOT_DIR_PATH="$(git rev-parse --show-toplevel)/"
BACKUP_DATA_DIR_PATH="${GIT_ROOT_DIR_PATH}.xdevkit/backup/data/"

OLD_BACKUP_DATA_DIR_PATH="${BACKUP_DATA_DIR_PATH}old/"
LOG_DIR_PATH="${GIT_ROOT_DIR_PATH}log/"
mkdir -p $LOG_DIR_PATH

BACKUP_FILE_PREFIX="backup_${CONTAINER_NAME}_${DB_NAME}_"
LOG_FILE_PATH="${LOG_DIR_PATH}rotate.log"

RETENTION_DAY_N=7

FILE_LIST=$(find "${OLD_BACKUP_DATA_DIR_PATH}" -type f -name "${BACKUP_FILE_PREFIX}*" -mtime +${RETENTION_DAY_N} -exec ls -la {} \;)

# oldの中から古いものをrotate 
find "${OLD_BACKUP_DATA_DIR_PATH}" -type f -name "${BACKUP_FILE_PREFIX}*" -mtime +${RETENTION_DAY_N} -exec rm -f {} \;

echo "=============== $(date +%Y/%m/%d-%H:%M:%S) ===============" >> $LOG_FILE_PATH
echo "Cleaning up old backups (older than ${RETENTION_DAY_N} days)" >> $LOG_FILE_PATH
echo -e "$FILE_LIST" >> $LOG_FILE_PATH
echo "log file: ${LOG_FILE_PATH}"

