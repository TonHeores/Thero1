/*
Navicat MySQL Data Transfer

Source Server         : localhost_3306
Source Server Version : 50553
Source Host           : localhost:3306
Source Database       : wch5

Target Server Type    : MYSQL
Target Server Version : 50553
File Encoding         : 65001

Date: 2019-02-17 18:04:12
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `t_player_info`
-- ----------------------------
DROP TABLE IF EXISTS `t_player_info`;

CREATE TABLE `t_player_info` (
  `uid` varchar(255) NOT NULL,
  `playerInfo` text NOT NULL,
  ctime TIMESTAMP NOT NULL,
  utime TIMESTAMP NOT NULL,
  PRIMARY KEY (`uid`),
  KEY `uid` (`uid`) USING HASH
) ENGINE=MyISAM DEFAULT CHARSET=utf8;






