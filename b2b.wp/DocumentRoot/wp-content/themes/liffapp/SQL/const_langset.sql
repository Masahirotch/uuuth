/*
 Navicat MySQL Data Transfer

 Source Server         : Adop VPS (root)
 Source Server Type    : MariaDB
 Source Server Version : 100138
 Source Host           : localhost:3306
 Source Schema         : oas

 Target Server Type    : MariaDB
 Target Server Version : 100138
 File Encoding         : 65001

 Date: 17/10/2019 14:03:01
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for const_langset
-- ----------------------------
DROP TABLE IF EXISTS `const_langset`;
CREATE TABLE `const_langset` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `set` varchar(255) DEFAULT NULL,
  `jp` text,
  `en` text,
  `cn` text,
  `tc` text,
  `ko` text,
  `th` text,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of const_langset
-- ----------------------------
BEGIN;
INSERT INTO `const_langset` VALUES (1, 'lang', 'jp', 'en', 'cn', 'tc', 'ko', 'th');
INSERT INTO `const_langset` VALUES (2, 'lang_code', 'ja-JP', 'en-US', 'zh-cmn-Hans', 'zh-cmn-Hant', 'ko', 'th');
INSERT INTO `const_langset` VALUES (3, 'more', 'もっと見る', 'For more', '了解更多', '瀏覽更多', '더 보기', 'อ่านรายละเอียด');
INSERT INTO `const_langset` VALUES (4, 'back', '戻る', 'Back', '返回', '返回', '돌아가기', 'ย้อนกลับ');
INSERT INTO `const_langset` VALUES (5, 'address', '住所', 'Address', '地址', '地址', '주소', 'ที่อยู่');
INSERT INTO `const_langset` VALUES (6, 'tel', '電話', 'Phone number', '电话号码', '電話號碼', '전화번호', 'เบอร์โทรศัพท์');
INSERT INTO `const_langset` VALUES (7, 'area', '地区', 'District', '地区', '地區', '지역', 'เขต');
INSERT INTO `const_langset` VALUES (8, 'privacy', 'プライバシーポリシー', 'privacy policy', '隐私权保护', '隱私權政策', '개인정보 취급방침', 'นโยบายความเป็นส่วนตัว');
INSERT INTO `const_langset` VALUES (9, 'google_lang_code', 'ja', 'en', 'zh-CN', 'zh-TW', 'ko', 'th');
INSERT INTO `const_langset` VALUES (10, 'home', 'トップ', 'HOME', '首页', '首頁', '홈', 'หน้าแรก');
INSERT INTO `const_langset` VALUES (17, 'open', '営業時間', 'Operating hours', '营业时间', '營業時間', '영업시간', NULL);
INSERT INTO `const_langset` VALUES (18, 'parking', '駐車場', 'Parking lot', '停车场', '停車場', '주차대수', NULL);
INSERT INTO `const_langset` VALUES (28, 'sitename', '沖縄エアポートシャトル', 'Okinawa Airport Shuttle', '冲绳机场穿梭巴士', '沖繩機場接駁巴士', '오키나와 에어포트 셔틀', 'Okinawa Airport Shuttle Bus');
INSERT INTO `const_langset` VALUES (29, 'alternate', 'ja', 'en', 'zh-Hans', 'zh-Hant', 'ko', NULL);
INSERT INTO `const_langset` VALUES (35, 'middle', '本島中部', 'Central region', '中部地区', '中部地區', '중부지역', NULL);
INSERT INTO `const_langset` VALUES (36, 'north', '本島北部', 'Northern region', '北部地区', '北部地區', '북부 지역', NULL);
INSERT INTO `const_langset` VALUES (37, 'south', '本島南部', 'Naha / Southern region', '那霸・南部地区', '那霸・南部地區', '나하 / 남부 지역', NULL);
INSERT INTO `const_langset` VALUES (67, 'attention', '注意', 'Attention', '注意事项', '注意事項', '주의 사항', NULL);
INSERT INTO `const_langset` VALUES (69, 'about', 'About us', 'About us', '关于我们', '關於我們', '회사개요', NULL);
INSERT INTO `const_langset` VALUES (70, 'corporation_name', '沖縄エアポートシャトルLLP', 'Okinawa Airport Shuttle LLP', '冲绳机场穿梭巴士LLP', '沖繩機場接駁巴士LLP', '오키나와 에어포트 셔틀 LLP', 'Okinawa Airport Shuttle LLP');
INSERT INTO `const_langset` VALUES (71, 'nemu_about', '沖縄エアポートシャトルについて', 'About Okinawa Airport Shuttle', '关于冲绳机场穿梭巴士', '關於沖繩機場接駁巴士', '오키나와 에어포트 셔틀에 대해서', NULL);
INSERT INTO `const_langset` VALUES (72, 'nemu_company', '会社概要', 'Company Profile', '公司简介', '公司概要', '회사 개요', NULL);
INSERT INTO `const_langset` VALUES (73, 'nemu_contact', 'お問合せフォーム', 'Contact Us', '问讯', '洽詢', '문의하기', NULL);
INSERT INTO `const_langset` VALUES (74, 'nemu_faq', 'よくあるご質問', 'FAQ', 'FAQ', 'FAQ', 'FAQ', NULL);
INSERT INTO `const_langset` VALUES (75, 'nemu_route', '運行ルート', 'Routes and Stops', '行车路线 / 站牌', '行車路線 / 站牌', '운행 노선', NULL);
INSERT INTO `const_langset` VALUES (76, 'nemu_timetable', '時刻表・料金', 'Schedules / fares', '时刻表及票价', '時刻表及車資', '시간표・요금', 'ตารางเวลา');
INSERT INTO `const_langset` VALUES (77, 'nemu_buy', 'オンライン予約', NULL, '在线预约', '網站事先購票的情況', '온라인 예약', NULL);
INSERT INTO `const_langset` VALUES (78, 'nemu_howtobuy', '購入方法', 'To purchase', NULL, NULL, '구입 방법', NULL);
INSERT INTO `const_langset` VALUES (79, 'nemu_guide', 'ご利用案内', 'Important information', NULL, NULL, '이용 안내', NULL);
INSERT INTO `const_langset` VALUES (80, 'nemu_stores', '乗車チケット販売所', 'Ticket booth', 'Ticket booth', 'Ticket booth', 'Ticket booth', 'สถานที่จำหน่ายตั๋วรถบัส');
INSERT INTO `const_langset` VALUES (81, 'header_h1', '那覇 (空港/市内) から沖縄美ら海水族館,ビーチ,<br class=\"brsp\">リゾートホテルに行くなら空港シャトルバスが断然便利！', 'The most convenient way to get to Okinawa Churaumi Aquarium and Motobu.', '前往冲绳美丽海水族馆、本部，搭乘机场穿梭巴士最方便！', '想去沖繩美麗海水族館・本部，搭機場接駁巴士最方便！', '츄라우미・모토부에 갈 때는 공항 셔틀버스가 단연코 편리', 'บัตรพาสโดยสารแบบไม่จำกัดเที่ยว การเดินทางท่องเที่ยวโดยรถบัส');
INSERT INTO `const_langset` VALUES (82, 'langage', '日本語', 'English', '简体中文', '繁體中文', '한국어', 'ภาษาไทย');
INSERT INTO `const_langset` VALUES (83, 'site_root', '/', '/en/', '/cn/', '/tc/', '/ko/', '/th/');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
