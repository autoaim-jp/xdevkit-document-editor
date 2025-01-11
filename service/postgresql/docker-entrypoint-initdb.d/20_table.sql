\c xl_db

create table chat_info.tag_list (
  tag_id varchar(36) primary key,
  tag_title varchar(256) not null
);
grant all privileges on chat_info.tag_list to xl_admin;

create table chat_info.chat_history (
  chat_id varchar(36),
  chat_title varchar(256) not null,
  is_visible boolean not null default true,
  -- tag_id varchar(36) references chat_info.tag_list(tag_id), -- この行を削除
  primary key(chat_id)
);
grant all privileges on chat_info.chat_history to xl_admin;

create table chat_info.chat_list (
  chat_id varchar(36) references chat_info.chat_history(chat_id),
  date_registered timestamp not null,
  role varchar(256) not null,
  content varchar(16384) not null
);
grant all privileges on chat_info.chat_list to xl_admin;

-- 新しいテーブルの作成と制約の追加
create table chat_info.tag_chat_list (
  tag_id varchar(36) not null,
  chat_id varchar(36) not null,
  date_registered timestamp not null,
  is_visible boolean not null default true,
  foreign key (tag_id) references chat_info.tag_list(tag_id),
  foreign key (chat_id) references chat_info.chat_history(chat_id),
  unique (tag_id, chat_id)
);
grant all privileges on chat_info.tag_chat_list to xl_admin;

