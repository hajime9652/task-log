# Hello Tasks
これは学習用のレポジトリです。

.envファイルの設定例（メール配信の設定はgmailなどを活用してください）
```
DOMAIN=localhost
CLIENT_HOST=localhost:3000
TRAEFIK_TAG=task-log
STACK_NAME=task-log

TRAEFIK_PUBLIC_NETWORK=traefik-public
TRAEFIK_PUBLIC_TAG=traefik-public

BACKEND_CORS_ORIGINS=["http://localhost","http://localhost:3000"]
PROJECT_NAME=hello-tasks
SECRET_KEY=
FIRST_SUPERUSER=user@example.com
FIRST_SUPERUSER_PASSWORD=user
SMTP_TLS=True
SMTP_PORT=587
SMTP_HOST=smtp-relay.gmail.com
SMTP_USER=
SMTP_PASSWORD=
EMAILS_FROM_EMAIL=
```

## サーバーサイド
- Webフレームワーク：[FastAPI](https://fastapi.tiangolo.com/)
- 認証認可：[FastAPI-users](https://fastapi-users.github.io/fastapi-users/10.1/)
- DB/ORM：Sqlite, [sqlalchemy](https://www.sqlalchemy.org/)

## クライアントサイド
- JSフレークワーク：[Nuxt3](https://v3.nuxtjs.org/)
- 状態管理：[pinia](https://pinia.vuejs.org/)
- CSSフレームワーク：[tailwindcss&daisyui](https://tailwindcss.nuxtjs.org/examples/daisyui)

# 確認
- メール配信環境がない・できない場合は、メールアドレスの検証はスルーできるようにしてください。メールアドレスの検証を行わなくて、ログインなどが可能です。
- OpenAPIで実際にユーザーを作成したり、削除したりしてみてください
    - SqliteでユーザーIDを確認する必要があります。この[vscodeの拡張機能](https://qiita.com/ritya/items/098835a96f3fcf7c6661)を使ってください

# 課題
1. 環境構築の課題：vscodeでの開発環境を構築してください。
    1. `git clone https://github.com/hajime9652/task-log`でクローンした後に、ワークスペースを開いてください。
    2. 環境変数の設定を行ってください。
    2. `docker compose up -d --build`でコンテナを立ち上げてください。
    3. remote containerでbackend/frontendのコンテナごとのvscodeのワークスペースを立ち上げてみてください。
    3. `docker compose logs -f`でログを確認して、全てのサービスが立ち上がっていることを確認してください。
2. FastAPI課題：
    1. remote-containerでbackendを開くか、dockerコマンドでコンテナにアタッチするかで、backendコンテナ内で`alembic upgrade head`を実行し、DBを初期化してください。
    1. [OpenAPIのドキュメント](http://api.localhost/docs)を開いて、auth/registerで`email": "user@example.com","password": "user"`と設定して、ユーザーを作成してください
    2. vscodeのSQLiteの拡張機能で、test.dbのuser一覧で作成されていることを確認してください。
    3. `backend_sqlite/init_db.sql`をSQLiteの拡張機能で実行して、ユーザーを更新してください。これも更新されていることを確認してください。
    4. OpenAPIで認証できることを確認してください。
3. CRUDの課題：
    1. `users/me`で自分の情報を確認してください。
    1. `users/me/projects`で自分のプロジェクト情報を確認してください。
    1. `users/me/project`で新しくプロジェクトを作成して、再度確認してください。
    1. `users/me/project/{project_id}`で新しく作成した、プロジェクトのタイトルを変更してください。これも再度確認してください。
4. 認証認可の課題：
    1. gmailなどフリーで使えるSMTPサーバーの設定([参考記事](https://kinsta.com/jp/blog/gmail-smtp-server/))を行って、メール配信を試してみてください。(これはできなくても大丈夫です)
    1. `utils/test-email`でテストメールが送れるか確認してください。
    3. `auth/request-verify-token`でメールアドレス検証用のトークンを発行してください。メールの設定ができてない場合は、`docker compose logs`でログを確認してください。出力するようになっています。
    2. `auth/forgot-password`でパスワードのリセット用のトークンを発行してください。これはメールが送れられません。`docker compose logs`でログを確認してください。出力するようになっています。
    3. パスワードのリセット用のメールを送信する関数を実装してください。
5. Vue/Nuxt：
    1. テーマが変更できるようになっています。触ってみてください。
    2. MainApp.vueを複数のコンポーネントに細分化してください。少なくともコメントがあるところはコンポーネントにしてください。これによって、コンポーネントの役割だったり、関心毎だったり、そのためのロジックが分離されることを理解してください。
    3. 細分化したコンポーネントを、MainApp.vueで呼び出して統合してください。

# Challenge

## サーバーサイド
Mongo dbでの実装にチャレンジしてください。
実際には、プロジェクトの立ち上げ・Dockerの使い方の確認がメインになっています。
- ディレクトリから作成してください。合わせて、docker-compose.ymlの設定を行ってください。[このような記事](https://laid-back-scientist.com/docker-mongo)を参考にしてください（記事の内容は未確認です）
- 認証認可は[こちら](https://github.com/fastapi-users/fastapi-users/tree/master/examples/beanie)を参照
- Project/RecordのCRUD処理もコピペして追加してください。


## クライアントサイド
パスワードを忘れた場合の画面と処理を実装してください。
- 新規のページの作成が必要です。
- パスワード再設定用のリンク（pagesにて設定するルート）が必要です。
- パスワードを忘れた場合には、リセット用のトークンをサーバーサイドから発行してもらう必要があります。
- リセット用のtokenはメールで送りますが、メールの設定ができていない場合は、バックエンドから発行されるtokenを使ったリンクを取得してください。このリンクがパスワード再設定用のリンクと紐づいています。tokenはパラメタとして渡されています。
