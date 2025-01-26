#! /bin/bash

CONTAINER_NAME="mermaid-chatgpt-editor-postgresql"
DB_NAME="xl_db"
DB_USER="postgres"

SQL_1=$(cat <<EOF
select 1;
EOF
)
# SQL_1=$(cat <<EOF
# create table chat_info.tag_chat_list (
#   tag_id varchar(36) not null,
#   chat_id varchar(36) not null,
#   date_registered timestamp not null,
#   foreign key (tag_id) references chat_info.tag_list(tag_id),
#   foreign key (chat_id) references chat_info.chat_history(chat_id),
#   unique (tag_id, chat_id)
# );
# EOF
# )

SQL_2=$(cat <<EOF
select 2;
EOF
)
# SQL_2=$(cat <<EOF
# grant all privileges on chat_info.tag_chat_list to xl_admin;
# EOF
# )

docker exec -it $CONTAINER_NAME psql -U $DB_USER $DB_NAME -c "$SQL_1"
docker exec -it $CONTAINER_NAME psql -U $DB_USER $DB_NAME -c "$SQL_2"

