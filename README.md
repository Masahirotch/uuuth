# HIYOSHI

* 日吉様各種システム
    * api           - 日吉関連API群
    * b2b.wp       - B2B受発注システム（ 現在はWordPress ）
    * admin - 統合管理環境 ( Nuxt App )
    * info  - 日吉の野菜情報 ( Nuxt App )

    * dashboard     - 新管理画面（野菜情報 / B2B / EC / Media ） ( Nuxt App )
    * ec    - 日吉の野菜情報 ( Nuxt App )
    * media         - B2B2Cプラットフォーム ( Nuxt App )


サーバー情報
```
HOST : 160.16.94.213
SERVER ROOT PASS : 98QN337M5EYY
MariaDB ROOT PASS : amaterasu
ssh user / kusanagi : amenomurakumo

PASS フレーズ　:  kusano
```


各アプリケーションの設定と概要
```
■ B2B受発注システム

Profile: hiyoshi
FQDN: hiyoshi.liff.cloud
Type: WordPress

DB_NAME : hiyoshi_wp
DB_USER : hiyoshi
DB_PASS : liff+db+hiyoshi

WordPress 情報
[管理画面](https://hiyoshi.liff.cloud/wp-admin/)
USER : hiyoshi
PASS : hiyoshi.B2B.LINE.APP

B2Bの受発注システム。
当初、管理画面機構をWordPressにて実装しようと試みたが、商品点数の多さなどから管理画面による管理を断念し、NaviCatにて直接DBを管理する手法に至ったため、実質、受注データCSVのダウンロード機能しか用いていない。



■ api
Profile: api
FQDN: hiyoshi.api.line.cx
Type: lamp



■ cdn
Profile: cdn
FQDN: cdn.hiyoshi.app
Type: lamp

info や media といったアプリケーションでアップロードした画像を保存、ホスティングするためのCDNサーバー。






■ dashboard
Profile: dashboard
FQDN: dashboard.hiyoshi.app
Type: lamp

DB_NAME : dashboard
DB_USER : dashboard
DB_PASS : dashboard

adminに代わり新たに作成している管理画面（ダッシュボード）
info,b2b,media,ec…の各アプリケーションの統合管理画面として構築を進めているが、要・不要データについて精査する必要がある。








■ hiyoshi.admin
Profile: hiyoshi.admin
FQDN: hiyoshi.admin.line.cx
Type: lamp



■ hiyoshi.b2b
Profile: hiyoshi.b2b
FQDN: b2b.hiyoshi.app
Type: lamp

DB_NAME : b2b
DB_USER : b2b
DB_PASS : hiyoshi#B2B.SYS






■ hiyoshi.ec
Profile: hiyoshi.ec
FQDN: ec.hiyoshi.app
Type: lamp

DB_NAME : b2c
DB_USER : b2c
DB_PASS : Hisyoshi.EC+APP!

SMTP
SMTP_HOST = "line-mail.sakura.ne.jp"
SMTP_USER = "hiyoshi@line.cx"
SMTP_PASS = "Hiyoshi@B2C4LINE"
SMTP_PORT = "587"


■ hiyoshi.info
Profile: hiyoshi.info
FQDN: hiyoshi.info.line.cx
Type: lamp

DB_NAME : hiyoshi_info
DB_USER : hiyoshi_info
DB_PASS : User_is#hiyoshi

■ media
Profile: media
FQDN: hiyoshi.media.line.cx
Type: lamp

DB_NAME : media
DB_USER : media
DB_PASS : HiyoshiMedia...!
```







MEMO 
```
pm2 アプリ起動

# npm
pm2 start "npm run start" --name {name}
pm2 start "npm run dev" --name {name}

# yarn
pm2 start yarn --name {name} -- start
pm2 start yarn --name {name} -- dev


# api server
Run migrate after pulling:
npm run db:migrate
```


