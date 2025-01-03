#! /bin/bash

docker exec -it xlapp-container-postgresql psql -U xl_admin xl_db -c "select * from access_info.client_list;"
docker exec -it xlapp-container-postgresql psql -U xl_admin xl_db -c "select * from access_info.secret_list;"

