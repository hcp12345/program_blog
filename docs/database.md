# 数据库设计

数据库名：`md_me_blog`，字符集 `utf8mb4`，排序规则 `utf8mb4_unicode_ci`，引擎 InnoDB。

初始化方式：`npm run init-db`（执行 `init-db.js`）或手动执行根目录 `database.sql`。

> ⚠️ `npm run init-db` 会重建表结构并插入示例数据，**会清空现有数据**。

## ER 关系图

```
users 1 ──── N articles（authorId，作者）
categories 1 ──── N articles（categoryId，可多级：parentId 自关联）
articles N ──── N tags（中间表 article_tags）
articles 1 ──── N comments（articleId）
comments 1 ──── N comments（parentId 自关联，嵌套回复）
```

## 表结构

### users 用户表

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| id | INT | PK, 自增 | |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 用户名 |
| email | VARCHAR(100) | UNIQUE, NOT NULL | 邮箱 |
| password | VARCHAR(200) | NOT NULL | bcrypt 加密后的密码 |
| nickname | VARCHAR(50) | | 昵称 |
| avatar | VARCHAR(200) | | 头像 URL |
| bio | VARCHAR(500) | | 个人简介 |
| role | VARCHAR(20) | 默认 `user` | 角色：`admin` 管理员 / `user` 普通用户 |
| created_at / updated_at | DATETIME | | 时间戳 |

### articles 文章表

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| id | INT | PK, 自增 | |
| title | VARCHAR(200) | NOT NULL | 标题 |
| slug | VARCHAR(200) | UNIQUE, NOT NULL | URL 别名 |
| content | TEXT | NOT NULL | Markdown 原文 |
| htmlContent | TEXT | | 渲染后的 HTML |
| excerpt | VARCHAR(500) | | 摘要 |
| coverImage | VARCHAR(500) | | 封面图 URL |
| status | VARCHAR(20) | 默认 `draft` | `draft` 草稿 / `published` 已发布 / `archived` 归档 |
| viewCount | INT | 默认 0 | 浏览量 |
| likeCount | INT | 默认 0 | 点赞数 |
| commentCount | INT | 默认 0 | 评论数 |
| isTop | TINYINT(1) | 默认 0 | 是否置顶 |
| categoryId | INT | | 所属分类（外键逻辑关联 categories.id） |
| authorId | INT | NOT NULL | 作者（逻辑关联 users.id） |
| created_at / updated_at | DATETIME | | 时间戳 |

索引：`slug`（唯一）、`status`、`categoryId`、`created_at`。

### categories 分类表

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| id | INT | PK, 自增 | |
| name | VARCHAR(50) | UNIQUE, NOT NULL | 分类名 |
| slug | VARCHAR(50) | UNIQUE, NOT NULL | URL 别名 |
| description | VARCHAR(500) | | 描述 |
| icon | VARCHAR(100) | | 图标 |
| parentId | INT | | 父分类 ID（自关联，支持多级） |
| sort | INT | 默认 0 | 排序权重 |

### tags 标签表

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| id | INT | PK, 自增 | |
| name | VARCHAR(50) | UNIQUE, NOT NULL | 标签名 |
| slug | VARCHAR(50) | UNIQUE, NOT NULL | URL 别名 |
| description | VARCHAR(500) | | 描述 |
| color | VARCHAR(20) | | 展示颜色（如 `#61dafb`） |
| articleCount | INT | 默认 0 | 文章计数（冗余字段） |

### comments 评论表

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| id | INT | PK, 自增 | |
| content | TEXT | NOT NULL | 评论内容 |
| authorName | VARCHAR(50) | NOT NULL | 评论者昵称 |
| authorEmail | VARCHAR(100) | NOT NULL | 评论者邮箱 |
| authorUrl | VARCHAR(200) | | 评论者网站 |
| authorIp | VARCHAR(50) | | 评论者 IP |
| authorAvatar | VARCHAR(200) | | 头像 |
| parentId | INT | | 父评论 ID（自关联，嵌套回复） |
| articleId | INT | NOT NULL | 所属文章 |
| status | VARCHAR(20) | 默认 `pending` | `pending` 待审核 / `approved` 通过 / `rejected` 拒绝 |
| likeCount | INT | 默认 0 | 点赞数 |
| created_at / updated_at | DATETIME | | 时间戳 |

### article_tags 文章-标签关联表（中间表）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| articleId | INT | 联合主键之一 |
| tagId | INT | 联合主键之一 |
| created_at | DATETIME | |

## 模型关联（Sequelize）

定义在各模型的 `associate` 方法中（`app/model/*.js`）：

```javascript
Article.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Article.belongsToMany(Tag, { through: 'article_tags', foreignKey: 'articleId', otherKey: 'tagId', as: 'tags' });
Article.hasMany(Comment, { foreignKey: 'articleId', as: 'comments' });
Article.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
User.hasMany(Article, { foreignKey: 'authorId', as: 'articles' });
```

注意：`article` 模型中查询嵌套评论时，`Comment` 模型同时以 `parent` / `replies` 别名自关联。

## 命名约定

- 数据库列名使用 **camelCase**（如 `categoryId`、`viewCount`，见 `config.sequelize.define.underscored: false`），时间戳列除外（`created_at` / `updated_at`）。
- 模型文件使用 **PascalCase 语义**（`app/model/article.js` 导出 `Article`）。
- 当前未使用数据库层面的物理外键约束，关联完整性由应用层保证。

## 修改表结构的流程

1. 更新 `app/model/` 中对应的 Sequelize 模型；
2. 同步更新 `init-db.js` 中的建表语句（以及 `database.sql`）；
3. 运行 `npm run init-db` 重新初始化（会清空数据，注意先备份）。

## 示例数据

`init-db.js` / `database.sql` 会插入：

- 默认管理员 `admin / admin@example.com / admin123`（role: admin）；
- 示例分类：技术、生活、读书；
- 示例标签：JavaScript、React、Node.js、前端。
