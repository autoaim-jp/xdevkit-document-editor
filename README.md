# xdevkit-document-editor

# tree

`tree -Fa --filesfirst -I ".git/|.xdevkit/|*.swp"`

./
├── .gitignore
├── Makefile アプリの起動や停止。docker composeを実行。
├── README.md
├── docker-compose.yml service/の下の各コンテナの設定を定義
├── log/
└── service/ docker-compose.ymlのサービスと一致
    ├── postgresql/ データ保管
    │   ├── README.md
    │   ├── bin/
    │   │   ├── backup.sh* データを.xdevkit/にバックアップ
    │   │   ├── restore.sh* データリストア
    │   │   ├── rotate_backup.sh* .xdevkit/のバックアップデータをローテーション
    │   │   └── select.sh* コンテナでpsqlを実行
    │   ├── docker/
    │   │   └── Dockerfile
    │   └── docker-entrypoint-initdb.d/ コンテナビルド時に実行する定義ファイル
    │       ├── 10_init.sql データベース、ユーザ、スキーマ等作成
    │       ├── 20_table.sql テーブル作成
    │       └── 30_default_data.sql データ登録
    └── webApi/ htmlの配信とapiの処理を行うwebサーバ。nodejsを動かす
        ├── docker/
        │   └── Dockerfile
        └── src/ webサーバのソース
            ├── .env webサーバの環境設定 .gitignoreする
            ├── .env.sample .envのサンプル。値は空にしておく。.gitignoreしない。
            ├── app.js サーバのエントリポイント。express.jsを使う。.envを読む。view/配下をstatic配信。
            ├── package.json
            ├── node_modules/
            └── view/ フロントエンド資産
                ├── editor.html mermaidをリアルタイムに反映するだけのエディタページ
                └── index.html メインのページ。チャット機能、ライブビュー機能、過去チャット参照機能などがある。

