# Local

ローカル環境構築についてのすべての手順はこの資料に記載すること。

## 対象

- アプリケーション担当者 / Application Engineer
- インフラ担当者 / Infrastructure Engineer

## 初回構築手順

ローカル環境にこのアプリケーションをはじめて構築する場合、以下の手順を実行してください。

### 0. git clone

アプリケーションのソースコード（このファイルを含む）をリポジトリから clone する。

### 1. アプリケーション.env ファイルの作成

local/settings ディレクトリにローカル環境用の各アプリケーションの.env ファイルが格納されているので、各アプリケーションディレクトリ配下にコピーする。

```
cd adop-line-ec
cp local/settings/env/admin/.env.example admin/admin/.env
cp local/settings/env/aecadmin/.env.example aecadmin/.env
cp local/settings/env/api/.env.example api/.env
cp local/settings/env/b2b/.env.example b2b/.env
cp local/settings/env/dashboard/.env.example dashboard/.env
cp local/settings/env/ec/.env.example ec/.env
cp local/settings/env/info/.env.example info/info/.env
```

### 2. docker 用.env ファイルの作成

```
cp local/.env.example local/.env
```

### 3. api 用 config.json ファイルの作成

```
cp settings/api/config/config.json api/config/
```

api/config/config.json を以下のように変更
※.env ファイルの設定値に合わせて内容を変更すること。

```
{
  "development": {
    "username": "root",
    "password": "rootpass",
    "database": "aecdb",
    "host": "db",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": "rootpass",
    "database": "api_test",
    "host": "db",
    "dialect": "mysql"
  }
}
```

### 4. コンテナを起動する

local ディレクトリに移動して、以下コマンドでコンテナを起動する。

```shell
cd local
docker-compose up -d
```

環境によっては、ポート番号が衝突する等の問題により、コンテナが起動しない場合がある。必要に応じて、docker の.env、各アプリケーションの.env にてポート番号を指定すること。

```shell
# example

* /local/.env
# https-portal
HTTPS-PORT=3443

* /admin/admin/.env
API_URL       = "https://line-api.local:3443"
```

#### 備考

- HTTPS-PORT を 443 以外にした場合
  コンテナ起動後、「local/settings/https-portal/{ドメイン名}.ssl.conf」ファイルを以下のように変更

```shell
#proxy_set_header Host $host;
proxy_set_header Host $http_host;
```

コンテナに反映

```shell
docker-compose up -d
```

https-portal コンテナ内の nginx を reload

```shell
cd local
docker-compose exec https-portal service nginx reload
```

### 5. hosts ファイルに追記

指定のドメイン名でコンテナに接続できるようにローカル環境の hosts に以下を追記する。

- Linux: /etc/hosts
- Windows: C:\Windows\System32\drivers\etc\hosts

```shell
127.0.0.1           line-admin.local
127.0.0.1           line-aecadmin.local
127.0.0.1           line-api.local
127.0.0.1           line-b2b.wp.local
127.0.0.1           line-b2b.local
127.0.0.1           line-cdn.local
127.0.0.1           line-dashboard.local
127.0.0.1           line-ec.local
127.0.0.1           line-info.local
127.0.0.1           line-media.local
```

### 6. DB リストア

以下コマンドで DB にデータをリストアする。

- あらかじめ dump ファイルを用意し、local ディレクトリ配下に設置しておく

```shell
cd local
docker-compose exec db bash
mysql -u root -p < src/{dumpファイル}
exit
```

### 7. アプリケーションでパッケージインストール・アプリ起動 (b2b.wp 以外)

以下コマンドでパッケージインストールとアプリケーションの起動をする。

※admin

```shell
cd local
docker-compose exec admin npm install
docker-compose exec admin chown -R node:node node_modules
docker-compose exec admin npm run generate
docker-compose exec admin npm run build
docker-compose exec admin pm2 start "npm run start" --name admin
```

※aecadmin

```shell
cd local
docker-compose exec aecadmin npm install
docker-compose exec aecadmin chown -R node:node node_modules
docker-compose exec aecadmin npm run build
docker-compose exec aecadmin pm2 start "npm run dev" --name aecadmin
```

※b2b

```shell
cd local
docker-compose exec b2b yarn
docker-compose exec b2b chown -R node:node node_modules
docker-compose exec b2b yarn run build
docker-compose exec b2b pm2 start "yarn run dev" --name b2b
```

※dashboard

```shell
cd local
docker-compose exec dashboard npm install
docker-compose exec dashboard chown -R node:node node_modules
docker-compose exec dashboard npm run build
docker-compose exec dashboard pm2 start "npm run dev" --name dashboard
```

※ec

```shell
cd local
docker-compose exec ec npm install
docker-compose exec ec chown -R node:node node_modules
docker-compose exec ec npm run build
docker-compose exec ec pm2 start "npm run dev" --name ec
```

※info

```shell
cd local
docker-compose exec info npm install
docker-compose exec info chown -R node:node node_modules
docker-compose exec info npm run build
docker-compose exec info pm2 start "npm run start" --name info
```

※api

```shell
cd local
docker-compose exec api npm install
docker-compose exec api chown -R node:node node_modules
docker-compose exec api npm run db:setup
docker-compose exec api pm2 start src/server.js --name api
```

### 8. b2b.wp の設定

STG 環境からファイルをコピーし、以下に配置する。

```shell
adop-line-ec/b2b.wp/DocumentRoot/wp-admin
adop-line-ec/b2b.wp/DocumentRoot/wp-includes
adop-line-ec/b2b.wp/DocumentRoot/wp-config.php
```

#### 備考

wp-config.php の以下の値は.env の設定値に合わせて変更する。

```shell
define( 'DB_NAME', 'hiyoshi_wp' );

/** MySQL データベースのユーザー名 */
define( 'DB_USER', 'root' );

/** MySQL データベースのパスワード */
define( 'DB_PASSWORD', 'rootpass' );

/** MySQL のホスト名 */
define( 'DB_HOST', 'db' );
```

### 9. アプリ起動確認

以下ドメインでアプリ画面に接続できるか確認

```shell
admin ⇒ line-admin.local
aecadmin ⇒ line-aecadmin.local
api ⇒ line-api.local
b2b.wp ⇒ line-b2b.wp.local
b2b ⇒ line-b2b.local
dashboard ⇒ line-dashboard.local
ec ⇒ line-ec.local
info ⇒ line-info.local
```

#### 備考

- cdn は資材置き場
- media は現状使用していない

### 10. その他

- アプリが正常に動かない場合は、各アプリケーションの.env、DB データ、LINE Developers などの設定値を見直すこと
- 各アプリケーションの.env を変更した際は、以下コマンドでアプリケーションを再起動する

api 以外

```shell
docker-compose exec {コンテナ名} pm2 stop {アプリ名}
docker-compose exec {コンテナ名} npm run build
docker-compose exec {コンテナ名} pm2 start {アプリ名}

* package.jsonを更新した場合は最初に以下を実行
docker-compose exec {コンテナ名} npm install

# example
docker-compose exec admin pm2 stop admin
docker-compose exec admin npm run build
docker-compose exec admin pm2 start admin
```

api

```shell
docker-compose exec api pm2 restart api --update-env

* migration ファイルを更新した場合は最初に以下を実行
docker-compose exec api npx sequelize-cli db:migrate
```

## 2 回目以降の構築手順

### 0. コンテナを起動する

local ディレクトリに移動して、以下コマンドでコンテナを起動する。

```shell
cd adop-line-ec/local
docker-compose up -d
```

### 1. アプリケーションを起動する

以下コマンドでアプリケーションを起動する。

```shell
docker-compose exec admin pm2 start "npm run start" --name admin
docker-compose exec aecadmin pm2 start "npm run dev" --name aecadmin
docker-compose exec b2b pm2 start "yarn run dev" --name b2b
docker-compose exec dashboard pm2 start "npm run dev" --name dashboard
docker-compose exec ec pm2 start "npm run dev" --name ec
docker-compose exec info pm2 start "npm run start" --name info
docker-compose exec api pm2 start src/server.js --name api
```
