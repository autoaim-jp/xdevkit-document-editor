#! /bin/bash

CONTAINER_NAME="mermaid-chatgpt-editor-postgresql"
DB_NAME="xl_db"
DB_USER="postgres"

SQL_1="select 1;"
SQL_2="select 2;"

docker exec -it $CONTAINER_NAME psql -U $DB_USER $DB_NAME -c "$SQL_1"
docker exec -it $CONTAINER_NAME psql -U $DB_USER $DB_NAME -c "$SQL_2"

