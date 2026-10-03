const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function initDatabase() {
  // 先创建数据库
  let connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
  });

  try {
    console.log('连接数据库成功...');

    // 创建数据库
    await connection.execute('CREATE DATABASE IF NOT EXISTS md_me_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('数据库创建成功');

    await connection.end();

    // 重新连接，使用指定数据库
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: 'md_me_blog',
    });

    // 创建表
    const tables = [
      // 先删除旧表
      'DROP TABLE IF EXISTS chat_messages',
      'DROP TABLE IF EXISTS chat_sessions',
      'DROP TABLE IF EXISTS chat_settings',
      'DROP TABLE IF EXISTS article_tags',
      'DROP TABLE IF EXISTS comments',
      'DROP TABLE IF EXISTS articles',
      'DROP TABLE IF EXISTS tags',
      'DROP TABLE IF EXISTS categories',
      'DROP TABLE IF EXISTS users',

      // 用户表
      `CREATE TABLE users (
        id INT(11) NOT NULL AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL,
        password VARCHAR(200) NOT NULL,
        nickname VARCHAR(50) DEFAULT NULL,
        avatar VARCHAR(200) DEFAULT NULL,
        bio VARCHAR(500) DEFAULT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        createdAt DATETIME DEFAULT NULL,
        updatedAt DATETIME DEFAULT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY username (username),
        UNIQUE KEY email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // 分类表
      `CREATE TABLE categories (
        id INT(11) NOT NULL AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL,
        slug VARCHAR(50) NOT NULL,
        description VARCHAR(500) DEFAULT NULL,
        icon VARCHAR(100) DEFAULT NULL,
        parentId INT(11) DEFAULT NULL,
        sort INT(11) DEFAULT 0,
        createdAt DATETIME DEFAULT NULL,
        updatedAt DATETIME DEFAULT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY name (name),
        UNIQUE KEY slug (slug),
        KEY parentId (parentId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // 标签表
      `CREATE TABLE tags (
        id INT(11) NOT NULL AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL,
        slug VARCHAR(50) NOT NULL,
        description VARCHAR(500) DEFAULT NULL,
        color VARCHAR(20) DEFAULT NULL,
        articleCount INT(11) DEFAULT 0,
        createdAt DATETIME DEFAULT NULL,
        updatedAt DATETIME DEFAULT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY name (name),
        UNIQUE KEY slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // 文章表
      `CREATE TABLE articles (
        id INT(11) NOT NULL AUTO_INCREMENT,
        title VARCHAR(200) NOT NULL,
        slug VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        htmlContent TEXT DEFAULT NULL,
        excerpt VARCHAR(500) DEFAULT NULL,
        coverImage VARCHAR(500) DEFAULT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'draft',
        viewCount INT(11) DEFAULT 0,
        likeCount INT(11) DEFAULT 0,
        commentCount INT(11) DEFAULT 0,
        isTop TINYINT(1) DEFAULT 0,
        categoryId INT(11) DEFAULT NULL,
        authorId INT(11) NOT NULL,
        createdAt DATETIME DEFAULT NULL,
        updatedAt DATETIME DEFAULT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY slug (slug),
        KEY status (status),
        KEY categoryId (categoryId),
        KEY createdAt (createdAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // 评论表
      `CREATE TABLE comments (
        id INT(11) NOT NULL AUTO_INCREMENT,
        content TEXT NOT NULL,
        authorName VARCHAR(50) NOT NULL,
        authorEmail VARCHAR(100) NOT NULL,
        authorUrl VARCHAR(200) DEFAULT NULL,
        authorIp VARCHAR(50) DEFAULT NULL,
        authorAvatar VARCHAR(200) DEFAULT NULL,
        parentId INT(11) DEFAULT NULL,
        articleId INT(11) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        likeCount INT(11) DEFAULT 0,
        createdAt DATETIME DEFAULT NULL,
        updatedAt DATETIME DEFAULT NULL,
        PRIMARY KEY (id),
        KEY articleId (articleId),
        KEY status (status),
        KEY parentId (parentId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // 文章标签关联表
      `CREATE TABLE article_tags (
        articleId INT(11) NOT NULL,
        tagId INT(11) NOT NULL,
        createdAt DATETIME DEFAULT NULL,
        updatedAt DATETIME DEFAULT NULL,
        PRIMARY KEY (articleId, tagId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // AI 客服会话表
      `CREATE TABLE chat_sessions (
        id INT(11) NOT NULL AUTO_INCREMENT,
        userId INT(11) DEFAULT NULL,
        ip VARCHAR(50) DEFAULT NULL,
        title VARCHAR(200) DEFAULT '新对话',
        createdAt DATETIME DEFAULT NULL,
        updatedAt DATETIME DEFAULT NULL,
        PRIMARY KEY (id),
        KEY userId (userId),
        KEY ip (ip)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // AI 客服消息表（含工具调用记录，作为客服质检数据保留）
      `CREATE TABLE chat_messages (
        id INT(11) NOT NULL AUTO_INCREMENT,
        sessionId INT(11) NOT NULL,
        role VARCHAR(20) NOT NULL,
        content TEXT DEFAULT NULL,
        toolName VARCHAR(50) DEFAULT NULL,
        toolArgs JSON DEFAULT NULL,
        tokens INT(11) DEFAULT 0,
        createdAt DATETIME DEFAULT NULL,
        updatedAt DATETIME DEFAULT NULL,
        PRIMARY KEY (id),
        KEY sessionId (sessionId),
        KEY createdAt (createdAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // AI 客服配置表
      `CREATE TABLE chat_settings (
        \`key\` VARCHAR(50) NOT NULL,
        \`value\` VARCHAR(200) NOT NULL,
        createdAt DATETIME DEFAULT NULL,
        updatedAt DATETIME DEFAULT NULL,
        PRIMARY KEY (\`key\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    ];

    for (const table of tables) {
      await connection.execute(table);
    }
    console.log('数据表创建成功');

    // 插入示例数据
    // 管理员密码使用 bcrypt 加密存储（与登录接口的 bcrypt.compare 保持一致）
    const adminHash = await bcrypt.hash('admin123', 10);
    const inserts = [
      `INSERT IGNORE INTO users (username, email, password, nickname, role) VALUES ('admin', 'admin@example.com', '${adminHash}', '管理员', 'admin')`,
      'INSERT IGNORE INTO categories (name, slug, description, sort) VALUES (\'技术\', \'tech\', \'技术相关文章\', 1), (\'生活\', \'life\', \'生活随笔\', 2), (\'读书\', \'reading\', \'读书笔记\', 3)',
      'INSERT IGNORE INTO tags (name, slug, color) VALUES (\'JavaScript\', \'javascript\', \'#f7df1e\'), (\'React\', \'react\', \'#61dafb\'), (\'Node.js\', \'nodejs\', \'#68a063\'), (\'前端\', \'frontend\', \'#e34c26\')',
      'INSERT IGNORE INTO articles (title, slug, content, excerpt, status, authorId, categoryId) VALUES (\'欢迎使用 MD Blog\', \'welcome-to-md-blog\', \'# 欢迎使用 MD Blog\n\n这是一个基于 Egg.js + React + MySQL + Markdown 的现代化博客系统。\n\n## 特性\n\n- 支持 Markdown 编辑\n- 分类和标签\n- 评论系统\n- 全文搜索\n\n开始你的博客之旅吧！\', \'欢迎使用 MD Blog，这是一个现代化的博客系统。\', \'published\', 1, 1)',
      // AI 客服默认配置
      'INSERT IGNORE INTO chat_settings (`key`, `value`) VALUES (\'rate_limit_per_ip_per_day\', \'50\'), (\'draft_publish_mode\', \'manual\')',
    ];

    for (const insert of inserts) {
      await connection.execute(insert);
    }
    console.log('示例数据插入成功');

  } catch (error) {
    console.error('数据库初始化失败:', error.message);
  } finally {
    await connection.end();
  }
}

initDatabase();
