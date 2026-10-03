-- 创建数据库
CREATE DATABASE IF NOT EXISTS `md_me_blog` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `md_me_blog`;

-- 用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(200) NOT NULL,
  `nickname` VARCHAR(50) DEFAULT NULL,
  `avatar` VARCHAR(200) DEFAULT NULL,
  `bio` VARCHAR(500) DEFAULT NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'user',
  `created_at` DATETIME DEFAULT NULL,
  `updated_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `username` (`username`),
  KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 分类表
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `slug` VARCHAR(50) NOT NULL UNIQUE,
  `description` VARCHAR(500) DEFAULT NULL,
  `icon` VARCHAR(100) DEFAULT NULL,
  `parentId` INT(11) DEFAULT NULL,
  `sort` INT(11) DEFAULT 0,
  `created_at` DATETIME DEFAULT NULL,
  `updated_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `slug` (`slug`),
  KEY `parentId` (`parentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 标签表
CREATE TABLE IF NOT EXISTS `tags` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `slug` VARCHAR(50) NOT NULL UNIQUE,
  `description` VARCHAR(500) DEFAULT NULL,
  `color` VARCHAR(20) DEFAULT NULL,
  `articleCount` INT(11) DEFAULT 0,
  `created_at` DATETIME DEFAULT NULL,
  `updated_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 文章表
CREATE TABLE IF NOT EXISTS `articles` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(200) NOT NULL UNIQUE,
  `content` TEXT NOT NULL,
  `htmlContent` TEXT DEFAULT NULL,
  `excerpt` VARCHAR(500) DEFAULT NULL,
  `coverImage` VARCHAR(500) DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'draft',
  `viewCount` INT(11) DEFAULT 0,
  `likeCount` INT(11) DEFAULT 0,
  `commentCount` INT(11) DEFAULT 0,
  `isTop` TINYINT(1) DEFAULT 0,
  `categoryId` INT(11) DEFAULT NULL,
  `authorId` INT(11) NOT NULL,
  `created_at` DATETIME DEFAULT NULL,
  `updated_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `status` (`status`),
  KEY `categoryId` (`categoryId`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 评论表
CREATE TABLE IF NOT EXISTS `comments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `content` TEXT NOT NULL,
  `authorName` VARCHAR(50) NOT NULL,
  `authorEmail` VARCHAR(100) NOT NULL,
  `authorUrl` VARCHAR(200) DEFAULT NULL,
  `authorIp` VARCHAR(50) DEFAULT NULL,
  `authorAvatar` VARCHAR(200) DEFAULT NULL,
  `parentId` INT(11) DEFAULT NULL,
  `articleId` INT(11) NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
  `likeCount` INT(11) DEFAULT 0,
  `created_at` DATETIME DEFAULT NULL,
  `updated_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `articleId` (`articleId`),
  KEY `status` (`status`),
  KEY `parentId` (`parentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 文章标签关联表
CREATE TABLE IF NOT EXISTS `article_tags` (
  `articleId` INT(11) NOT NULL,
  `tagId` INT(11) NOT NULL,
  `created_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`articleId`, `tagId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入默认管理员用户（密码: admin123，需要加密）
-- 注意：实际使用时应该使用 bcrypt 等加密
INSERT INTO `users` (`username`, `email`, `password`, `nickname`, `role`) VALUES
('admin', 'admin@example.com', '$2b$10$example_hash_please_replace', '管理员', 'admin')
ON DUPLICATE KEY UPDATE `username` = `username`;

-- 插入示例分类
INSERT INTO `categories` (`name`, `slug`, `description`, `sort`) VALUES
('技术', 'tech', '技术相关文章', 1),
('生活', 'life', '生活随笔', 2),
('读书', 'reading', '读书笔记', 3)
ON DUPLICATE KEY UPDATE `name` = `name`;

-- 插入示例标签
INSERT INTO `tags` (`name`, `slug`, `color`) VALUES
('JavaScript', 'javascript', '#f7df1e'),
('React', 'react', '#61dafb'),
('Node.js', 'nodejs', '#68a063'),
('前端', 'frontend', '#e34c26')
ON DUPLICATE KEY UPDATE `name` = `name`;

-- ============================================================
-- AI 智能客服相关表
-- 注意：Sequelize 模型使用 camelCase 时间戳（createdAt/updatedAt），
--       因此以下表按 createdAt/updatedAt 建列（与上方旧表写法不同）。
-- 推荐直接使用 `npm run init-db` 初始化，本文件供手动建表参考。
-- ============================================================

-- 会话表
CREATE TABLE IF NOT EXISTS `chat_sessions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `userId` INT(11) DEFAULT NULL COMMENT '用户ID，游客为 NULL',
  `ip` VARCHAR(50) DEFAULT NULL COMMENT '访客 IP，用于限流与质检溯源',
  `title` VARCHAR(200) DEFAULT '新对话',
  `createdAt` DATETIME DEFAULT NULL,
  `updatedAt` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `ip` (`ip`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 消息表（含工具调用记录，作为客服质检数据长期保留）
CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `sessionId` INT(11) NOT NULL,
  `role` VARCHAR(20) NOT NULL COMMENT 'user / assistant / tool',
  `content` TEXT DEFAULT NULL,
  `toolName` VARCHAR(50) DEFAULT NULL,
  `toolArgs` JSON DEFAULT NULL,
  `tokens` INT(11) DEFAULT 0,
  `createdAt` DATETIME DEFAULT NULL,
  `updatedAt` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sessionId` (`sessionId`),
  KEY `createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 智能客服配置表
CREATE TABLE IF NOT EXISTS `chat_settings` (
  `key` VARCHAR(50) NOT NULL,
  `value` VARCHAR(200) NOT NULL,
  `createdAt` DATETIME DEFAULT NULL,
  `updatedAt` DATETIME DEFAULT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `chat_settings` (`key`, `value`) VALUES
('rate_limit_per_ip_per_day', '50'),
('draft_publish_mode', 'manual')
ON DUPLICATE KEY UPDATE `value` = `value`;
