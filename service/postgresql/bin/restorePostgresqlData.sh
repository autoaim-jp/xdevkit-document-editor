#! /bin/bash

docker cp ./backup/data-postgresql.sql xlapp-container-postgresql:/tmp/backup-postgresql.sql
docker exec -it xlapp-container-postgresql pg_restore -U postgres --clean -d xl_db /tmp/backup-postgresql.sql
docker exec -it xlapp-container-postgresql rm /tmp/backup-postgresql.sql

