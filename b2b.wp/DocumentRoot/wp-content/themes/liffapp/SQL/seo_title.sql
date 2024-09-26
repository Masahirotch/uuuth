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

 Date: 17/10/2019 14:03:25
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for seo_title
-- ----------------------------
DROP TABLE IF EXISTS `seo_title`;
CREATE TABLE `seo_title` (
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
-- Records of seo_title
-- ----------------------------
BEGIN;
INSERT INTO `seo_title` VALUES (5, '那覇 (空港/市内) から沖縄美ら海水族館,ビーチ,リゾートホテルに行くなら空港シャトルバスが断然便利！', 'Go to Okinawa Churaumi Aquarium, beaches, resort hotels with Okinawa Airport Shuttle', '', '', '', 'บัตรพาสโดยสารแบบไม่จำกัดเที่ยว การเดินทางท่องเที่ยวโดยรถบัส');
INSERT INTO `seo_title` VALUES (11, '', '', '', '', '', '');
INSERT INTO `seo_title` VALUES (55, '', '', '', '', '', '');
INSERT INTO `seo_title` VALUES (59, '', '', '', '', '', '');
INSERT INTO `seo_title` VALUES (68, '', '', '', '', '', '');
INSERT INTO `seo_title` VALUES (79, 'バスでビーチに行こう ! ', 'Let’s head to the beach by bus! ', '搭巴士去海滩吧！ ', '搭巴士去海灘吧！ ', '직행버스를 타고 해변으로! ', '');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
