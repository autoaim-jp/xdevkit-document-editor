# バックアップとリストア

`crontab -l && crontab -e`
で以下のように設定  

```
5 5 * * * /path/to/xdevkit-document-editor/service/postgresql/bin/backup.sh >> /dev/null 2>&1
5 6 * * * /path/to/xdevkit-document-editor/service/postgresql/bin/rotate_backup.sh >> /dev/null 2>&1
```

# backup.sh

最新のバックアップを作成  

`/path/to/xdevkit-document-editor/.xdevkit/backup/data/latest/backup_コンテナ名_DB名_日時.sql`

2世代前のバックアップは、old/に移動  
`/path/to/xdevkit-document-editor/.xdevkit/backup/data/old/backup_コンテナ名_DB名_日時.sql`

# restore.sh

最新のバックアップからリストア  

`/path/to/xdevkit-document-editor/.xdevkit/backup/data/latest/backup_コンテナ名_DB名_日時.sql`

引数でファイルを渡すと、それをリストア  


# rotate_backup.sh

2世代以前のバックアップがold/にある。この中の7日より前に作成したファイルを削除。rotate_backup.shで指定。  
`/path/to/xdevkit-document-editor/.xdevkit/backup/data/latest/backup_コンテナ名_DB名_日時.sql`
