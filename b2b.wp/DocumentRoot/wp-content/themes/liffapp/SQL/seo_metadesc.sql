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

 Date: 17/10/2019 14:03:13
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for seo_metadesc
-- ----------------------------
DROP TABLE IF EXISTS `seo_metadesc`;
CREATE TABLE `seo_metadesc` (
  `ID` bigint(20) NOT NULL,
  `jp` varchar(255) DEFAULT NULL,
  `en` varchar(255) DEFAULT NULL,
  `cn` varchar(255) DEFAULT NULL,
  `tc` varchar(255) DEFAULT NULL,
  `ko` varchar(255) DEFAULT NULL,
  `th` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of seo_metadesc
-- ----------------------------
BEGIN;
INSERT INTO `seo_metadesc` VALUES (5, '沖縄エアポートシャトルは、那覇空港から本部まで主要な観光エリア全てを通る、沖縄初の定期運航バス。沖縄美ら海水族館をはじめ、古宇利島や北部の離島など、何度も乗り継いだりレンタカーを使っていた観光スポットも手軽にアクセス可能に！', 'If you are going to Okinawa Churaumi Aquarium, beaches, resort hotels from Naha (airport/city) then airport shuttle bus is definitely convenient! Okinawa Airport Shuttle ', '', '', '', 'ถ้าต้องการที่จะไปยังสถานที่ท่องเที่ยวยอดนิยมบนเกาะหลักของจังหวัดโอกินาว่า แนะนำให้ใช้ ”บัตรพาสโดยสารแบบไม่จำกัดเที่ยว„ ที่สามารถนั่งรถบัสจากท่าอากาศยานโอกินาว่าไปยังสถานทีท่องเที่ยวต่างๆ');
INSERT INTO `seo_metadesc` VALUES (11, '', '', '', '', '', '');
INSERT INTO `seo_metadesc` VALUES (55, '', '', '', '', '', '');
INSERT INTO `seo_metadesc` VALUES (59, '', '', '', '', '', '');
INSERT INTO `seo_metadesc` VALUES (68, '', '', '', '', '', '');
INSERT INTO `seo_metadesc` VALUES (79, '沖縄エアポートシャトルなら、ホテル＆ビーチまで那覇市内から約1時間で到着！リゾートホテル、ビーチ、絶景ポイントや観光スポットも満載！西海岸ビーチで沖縄の魅力を満喫しよう！', 'The bus stops at major resort hotels, beaches, spectacular view points and sightseeing locations! Enjoy the beauty of Okinawa\\\'s west coast beach!', '如果搭乘冲绳机场穿梭巴士，从那霸市区出发大约1小时即可到达酒店或海滩哦！有度假酒店、海滩、绝美景点或观光景点等，快来西海岸海滩享受冲绳的魅力吧！', '如果搭乘沖繩機場接駁巴士，從那霸市區出發大約1小時即可到達飯店或海灘喔！有渡假飯店、海灘、絕美景點或觀光景點等非常熱鬧！快來西海岸海灘享受沖繩的魅力吧！', '오키나와 에어포트 셔틀로 이동하면 나하시내에서 호텔＆해변까지 약 1시간만에 도착！리조트 호텔과 해변, 해안 명소가 가득한 서해안 해변에서 오키나와의 매력을 느껴보세요!', '');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
