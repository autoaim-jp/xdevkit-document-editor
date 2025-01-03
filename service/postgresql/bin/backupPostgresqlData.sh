#! /bin/bash

mkdir -p ./backup/
docker exec xlapp-container-postgresql pg_dump -U postgres -Fc -c --if-exists -d xl_db > ./backup/data-postgresql.sql

