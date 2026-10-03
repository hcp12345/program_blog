-- ============================================================
-- MD Blog 数据库初始化脚本（MySQL 8.0+）
-- ------------------------------------------------------------
-- 字符集：utf8mb4 / utf8mb4_unicode_ci
-- 时间戳：Sequelize 模型使用 camelCase（define.underscored = false），
--         因此所有表的时间戳列统一为 createdAt / updatedAt。
-- Docker：docker-compose 会把本文件挂载到 MySQL 容器的
--         /docker-entrypoint-initdb.d，仅在数据卷「首次初始化」时执行。
-- 手动执行：mysql -uroot -p < database.sql
-- ============================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `md_me_blog` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `md_me_blog`;

-- 用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password` VARCHAR(200) NOT NULL,
  `nickname` VARCHAR(50) DEFAULT NULL,
  `avatar` VARCHAR(200) DEFAULT NULL,
  `bio` VARCHAR(500) DEFAULT NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'user',
  `createdAt` DATETIME DEFAULT NULL,
  `updatedAt` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_username` (`username`),
  UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 分类表
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `slug` VARCHAR(50) NOT NULL,
  `description` VARCHAR(500) DEFAULT NULL,
  `icon` VARCHAR(100) DEFAULT NULL,
  `parentId` INT(11) DEFAULT NULL,
  `sort` INT(11) DEFAULT 0,
  `createdAt` DATETIME DEFAULT NULL,
  `updatedAt` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_categories_name` (`name`),
  UNIQUE KEY `uk_categories_slug` (`slug`),
  KEY `parentId` (`parentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 标签表
CREATE TABLE IF NOT EXISTS `tags` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `slug` VARCHAR(50) NOT NULL,
  `description` VARCHAR(500) DEFAULT NULL,
  `color` VARCHAR(20) DEFAULT NULL,
  `articleCount` INT(11) DEFAULT 0,
  `createdAt` DATETIME DEFAULT NULL,
  `updatedAt` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tags_name` (`name`),
  UNIQUE KEY `uk_tags_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 文章表
CREATE TABLE IF NOT EXISTS `articles` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(200) NOT NULL,
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
  `createdAt` DATETIME DEFAULT NULL,
  `updatedAt` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_articles_slug` (`slug`),
  KEY `status` (`status`),
  KEY `categoryId` (`categoryId`),
  KEY `createdAt` (`createdAt`)
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
  `createdAt` DATETIME DEFAULT NULL,
  `updatedAt` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `articleId` (`articleId`),
  KEY `status` (`status`),
  KEY `parentId` (`parentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 文章标签关联表（多对多）
CREATE TABLE IF NOT EXISTS `article_tags` (
  `articleId` INT(11) NOT NULL,
  `tagId` INT(11) NOT NULL,
  `createdAt` DATETIME DEFAULT NULL,
  `updatedAt` DATETIME DEFAULT NULL,
  PRIMARY KEY (`articleId`, `tagId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 初始数据
-- ============================================================

-- 默认管理员（用户名 admin / 密码 admin123）
-- 密码为 bcrypt 哈希，与后端登录接口的 bcrypt.compare 一致
INSERT INTO `users` (`username`, `email`, `password`, `nickname`, `role`) VALUES
('admin', 'admin@example.com', '$2b$10$4hwdGshxCicN8a0F1cY7jek93DSXPIr53w864bay7DJd6uSjTmL4y', '管理员', 'admin')
ON DUPLICATE KEY UPDATE `username` = `username`;

-- 示例分类
INSERT INTO `categories` (`name`, `slug`, `description`, `sort`) VALUES
('技术', 'tech', '技术相关文章', 1),
('生活', 'life', '生活随笔', 2),
('读书', 'reading', '读书笔记', 3)
ON DUPLICATE KEY UPDATE `name` = `name`;

-- 示例标签
INSERT INTO `tags` (`name`, `slug`, `color`) VALUES
('JavaScript', 'javascript', '#f7df1e'),
('React', 'react', '#61dafb'),
('Node.js', 'nodejs', '#68a063'),
('前端', 'frontend', '#e34c26')
ON DUPLICATE KEY UPDATE `name` = `name`;

-- 欢迎文章
INSERT INTO `articles` (`title`, `slug`, `content`, `excerpt`, `status`, `authorId`, `categoryId`, `createdAt`, `updatedAt`) VALUES
('欢迎使用 MD Blog', 'welcome-to-md-blog', '# 欢迎使用 MD Blog\n\n这是一个基于 Egg.js + React + MySQL + Markdown 的现代化博客系统。\n\n## 特性\n\n- 支持 Markdown 编辑\n- 分类和标签\n- 评论系统\n- 全文搜索\n\n开始你的博客之旅吧！', '欢迎使用 MD Blog，这是一个现代化的博客系统。', 'published', 1, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE `title` = `title`;

-- ============================================================
-- AI 智能客服相关表
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
