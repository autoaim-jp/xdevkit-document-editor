#! /bin/bash

CONTAINER_NAME="mermaid-chatgpt-editor-postgresql"
DB_NAME="xl_db"
DB_USER="postgres"
BACKUP_HOST="crontransferbackup:~/${HOSTNAME}/${CONTAINER_NAME}/"

GIT_ROOT_DIR_PATH="$(git rev-parse --show-toplevel)/"
BACKUP_DATA_DIR_PATH="${GIT_ROOT_DIR_PATH}.xdevkit/backup/data/"

LATEST_BACKUP_DATA_DIR_PATH="${BACKUP_DATA_DIR_PATH}latest/"
OLD_BACKUP_DATA_DIR_PATH="${BACKUP_DATA_DIR_PATH}old/"
LOG_DIR_PATH="${GIT_ROOT_DIR_PATH}log/"
mkdir -p $LATEST_BACKUP_DATA_DIR_PATH
mkdir -p $OLD_BACKUP_DATA_DIR_PATH
mkdir -p $LOG_DIR_PATH

DATE_STR=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE_PREFIX="backup_${CONTAINER_NAME}_${DB_NAME}_"
BACKUP_FILE_PATH="${LATEST_BACKUP_DATA_DIR_PATH}${BACKUP_FILE_PREFIX}${DATE_STR}.sql"
LOG_FILE_PATH="${LOG_DIR_PATH}backup.log"

echo "=============== $(date +%Y/%m/%d-%H:%M:%S) ===============" >> $LOG_FILE_PATH

# prefixが一致するものはlatestからoldへ
mv ${LATEST_BACKUP_DATA_DIR_PATH}${BACKUP_FILE_PREFIX}* ${OLD_BACKUP_DATA_DIR_PATH} 2>/dev/null
echo "mv ${LATEST_BACKUP_DATA_DIR_PATH}${BACKUP_FILE_PREFIX}* ${OLD_BACKUP_DATA_DIR_PATH}" >> $LOG_FILE_PATH

# latestにバックアップ作成（oldはrotate対象ディレクトリ。誤って最新バックアップを消さないようにするためlatestに保存。）
docker exec $CONTAINER_NAME pg_dump -U $DB_USER -Fc -c --if-exists -d $DB_NAME > $BACKUP_FILE_PATH
echo "backup file: ${BACKUP_FILE_PATH}"

echo $BACKUP_FILE_PATH >> $LOG_FILE_PATH

# BACKUP_HOSTにバックアップを転送
scp $BACKUP_FILE_PATH $BACKUP_HOST

echo "scp $BACKUP_FILE_PATH $BACKUP_HOST" >> $LOG_FILE_PATH

echo "log file: ${LOG_FILE_PATH}"

