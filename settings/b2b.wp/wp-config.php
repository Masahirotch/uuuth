<?php
/**
 * WordPress の基本設定
 *
 * このファイルは、MySQL、テーブル接頭辞、秘密鍵、ABSPATH の設定を含みます。
 * より詳しい情報は {@link http://wpdocs.sourceforge.jp/wp-config.php_%E3%81%AE%E7%B7%A8%E9%9B%86 
 * wp-config.php の編集} を参照してください。MySQL の設定情報はホスティング先より入手できます。
 *
 * このファイルはインストール時に wp-config.php 作成ウィザードが利用します。
 * ウィザードを介さず、このファイルを "wp-config.php" という名前でコピーして直接編集し値を
 * 入力してもかまいません。
 *
 * @package WordPress
 */

// 注意: 
// Windows の "メモ帳" でこのファイルを編集しないでください !
// 問題なく使えるテキストエディタ
// (http://wpdocs.sourceforge.jp/Codex:%E8%AB%87%E8%A9%B1%E5%AE%A4 参照)
// を使用し、必ず UTF-8 の BOM なし (UTF-8N) で保存してください。

// ** MySQL 設定 - この情報はホスティング先から入手してください。 ** //
/** WordPress のためのデータベース名 */
define( 'DB_NAME', 'hiyoshi_wp' );

/** MySQL データベースのユーザー名 */
define( 'DB_USER', 'root' );

/** MySQL データベースのパスワード */
define( 'DB_PASSWORD', 'amaterasu' );

/** MySQL のホスト名 */
define( 'DB_HOST', 'localhost' );

/** データベースのテーブルを作成する際のデータベースの文字セット */
define( 'DB_CHARSET', 'utf8mb4' );

/** データベースの照合順序 (ほとんどの場合変更する必要はありません) */
define('DB_COLLATE', '');

/**#@+
 * 認証用ユニークキー
 *
 * それぞれを異なるユニーク (一意) な文字列に変更してください。
 * {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org の秘密鍵サービス} で自動生成することもできます。
 * 後でいつでも変更して、既存のすべての cookie を無効にできます。これにより、すべてのユーザーを強制的に再ログインさせることになります。
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         '|^6o<(:tuAY3Une80cUi2tRbr!wAmyXy06T`ASXlG9kw]$xtyHV5fNKW&=Kf:MT:' );
define( 'SECURE_AUTH_KEY',  '9&@|n!Np;s7A#N{:L9d-%PDad=r-{1-AxoQq5<[ZqML<`-mW@muJHjUa|2^4;a ?' );
define( 'LOGGED_IN_KEY',    ')WXCWf5b:tF4zkTw]M,F!Xl+|9/EZ5?Dy>:u*NAh/*8_i}onO;sG?7zt0e5_X_w)' );
define( 'NONCE_KEY',        '$J@}Al.3L-6T:Xt={f*aqtdN@eaT74j-a<PS;Q+uq.K-7o2s&Va/2-mPB2AaTSu5' );
define( 'AUTH_SALT',        ';ROL[[SA`:PF6smddOh[@<JivvBT<ZFR)Q;eqlSOs,p9M6A!GB^0HD86VdFyj{Q7' );
define( 'SECURE_AUTH_SALT', 'G BFmO^.VH.9{I&Qa-tQ0L5g>!4/ _wl2xqsP3i;qF;7*-3I-dY!MZ>}f@b=zp@+' );
define( 'LOGGED_IN_SALT',   'C70B/y%trppLX.@|Xe+fUq.eC^C.kY$:[JjQ)S=M c(c}:DY*xI;&>y(A2f-R5{6' );
define( 'NONCE_SALT',       'c yFY)TCv=||u6^IO89!49}kz5m070o}h;AQn^+07z1Y<]rghIE96/`ru}$HKilO' );



/* LINE ID を暗号化・複合化するPASS。変更不可（復号化できなくなるので） */
define('CRYPTPASS', 'HiyoshiB2B');

/* LINE ID を暗号化・複合化するPASS。変更不可（復号化できなくなるので） */
define('ID_LINK_LIFF_ID', '1654397924-3o7jAWDG');

/* LINE ID を暗号化・複合化するPASS。変更不可（復号化できなくなるので） */
define('API_TOKEN', 'hiyoshi.api.token');


define('INFO_TOKEN', 'hiyoshi.info.token');

/**#@-*/

/**
 * WordPress データベーステーブルの接頭辞
 *
 * それぞれにユニーク (一意) な接頭辞を与えることで一つのデータベースに複数の WordPress を
 * インストールすることができます。半角英数字と下線のみを使用してください。
 */
$table_prefix  = 'wp_';

/**
 * 開発者へ: WordPress デバッグモード
 *
 * この値を true にすると、開発中に注意 (notice) を表示します。
 * テーマおよびプラグインの開発者には、その開発環境においてこの WP_DEBUG を使用することを強く推奨します。
 */
define('WP_DEBUG', false);

#define('WP_ALLOW_MULTISITE', true);
#define('FORCE_SSL_ADMIN', true);
#define('WP_CACHE', true);

define('FS_METHOD', 'ftpsockets');
define('FTP_HOST', 'localhost');
define('FTP_USER', 'kusanagi');
#define('FTP_PASS', '*****');

/* 編集が必要なのはここまでです ! WordPress でブログをお楽しみください。 */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
