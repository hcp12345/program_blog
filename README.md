<<<<<<< HEAD
# program_blog
IT博客系统
=======
# MD Blog - 个人博客系统

基于 Egg.js + React (Vite) + MySQL + Markdown 的现代化个人博客系统。

## ✨ 功能特性

- ✅ **文章管理** - 创建、编辑、删除、发布文章
- ✅ **Markdown 编辑** - 支持 GitHub Flavored Markdown，代码高亮
- ✅ **分类系统** - 多级分类管理
- ✅ **标签系统** - 文章标签归类
- ✅ **评论系统** - 支持嵌套回复和评论审核
- ✅ **全文搜索** - 文章标题和内容搜索
- ✅ **点赞统计** - 文章点赞、浏览量统计
- ✅ **响应式设计** - 适配各种设备
- ✅ **管理后台** - 完整的后台管理系统

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- MySQL >= 5.7

### 1. 安装依赖

```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd frontend
npm install
```

### 2. 配置数据库

修改 `config/config.default.js` 中的数据库配置：

```javascript
config.sequelize = {
  dialect: 'mysql',
  host: 'localhost',
  port: 3306,
  database: 'md_me_blog',
  username: 'root',
  password: 'your_password',  // 修改为你的 MySQL 密码
  // ...
};
```

### 3. 初始化数据库

```bash
npm run init-db
```

这将创建数据库、表结构并插入示例数据。

### 4. 启动开发环境

#### 方式一：分别启动

```bash
# 终端 1 - 启动后端服务
npm run dev

# 终端 2 - 启动前端服务
cd frontend
npm run dev
```

#### 方式二：使用启动脚本

- Windows: `dev.bat`
- Linux/Mac: `./dev.sh`

### 5. 访问应用

- **前台页面**: http://localhost:3000
- **后台管理**: http://localhost:3000/admin
- **后端 API**: http://localhost:7001

## 📁 项目结构

```
md-me/
├── app/                    # 后端应用目录
│   ├── controller/         # 控制器
│   │   ├── article.js      # 文章控制器
│   │   ├── category.js     # 分类控制器
│   │   ├── comment.js      # 评论控制器
│   │   ├── search.js       # 搜索控制器
│   │   └── tag.js          # 标签控制器
│   ├── model/             # 数据模型
│   │   ├── article.js      # 文章模型
│   │   ├── category.js     # 分类模型
│   │   ├── comment.js      # 评论模型
│   │   ├── tag.js          # 标签模型
│   │   └── user.js         # 用户模型
│   ├── service/           # 服务层
│   └── middleware/        # 中间件
├── config/                # 配置文件
│   ├── config.default.js  # 应用配置
│   ├── plugin.js          # 插件配置
│   └── router.js          # 路由配置
├── frontend/              # 前端应用
│   ├── src/
│   │   ├── components/    # 组件
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── SearchBar.jsx
│   │   ├── pages/         # 页面
│   │   │   ├── HomePage.jsx
│   │   │   ├── ArticleDetailPage.jsx
│   │   │   ├── ArticleListPage.jsx
│   │   │   ├── ArticleEditor.jsx
│   │   │   ├── SearchPage.jsx
│   │   │   └── admin/     # 管理后台页面
│   │   ├── layouts/       # 布局
│   │   │   ├── MainLayout.jsx
│   │   │   └── AdminLayout.jsx
│   │   ├── services/      # API 服务
│   │   │   └── api.js
│   │   ├── App.jsx        # 应用入口
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── init-db.js            # 数据库初始化脚本
├── database.sql          # 数据库 SQL 文件
├── README.md
├── dev.bat               # Windows 启动脚本
└── dev.sh                # Linux/Mac 启动脚本
```

## 🎨 技术栈

### 后端
- **Egg.js** - 企业级 Node.js 框架
- **MySQL** - 关系型数据库
- **Sequelize** - ORM 框架
- **Marked + Highlight.js** - Markdown 解析和代码高亮
- **Egg-CORS** - 跨域支持
- **Egg-Validate** - 参数验证

### 前端
- **React 18** - UI 框架
- **Vite** - 快速构建工具
- **React Router** - 路由管理
- **Axios** - HTTP 客户端
- **TailwindCSS** - 样式框架
- **React Markdown** - Markdown 渲染

## 🔌 API 接口

### 文章相关
- `GET /api/v1/articles` - 获取文章列表
- `GET /api/v1/articles/:id` - 获取文章详情
- `GET /api/v1/articles/slug/:slug` - 根据 slug 获取文章
- `POST /api/v1/articles` - 创建文章
- `PUT /api/v1/articles/:id` - 更新文章
- `DELETE /api/v1/articles/:id` - 删除文章
- `POST /api/v1/articles/:id/like` - 点赞文章

### 分类相关
- `GET /api/v1/categories` - 获取所有分类
- `GET /api/v1/categories/:id` - 获取分类详情
- `POST /api/v1/categories` - 创建分类
- `PUT /api/v1/categories/:id` - 更新分类
- `DELETE /api/v1/categories/:id` - 删除分类

### 标签相关
- `GET /api/v1/tags` - 获取所有标签
- `GET /api/v1/tags/:id` - 获取标签详情
- `POST /api/v1/tags` - 创建标签
- `PUT /api/v1/tags/:id` - 更新标签
- `DELETE /api/v1/tags/:id` - 删除标签

### 评论相关
- `GET /api/v1/comments` - 获取评论列表
- `GET /api/v1/comments/:id` - 获取评论详情
- `POST /api/v1/comments` - 创建评论
- `PUT /api/v1/comments/:id` - 更新评论状态
- `DELETE /api/v1/comments/:id` - 删除评论

### 搜索相关
- `GET /api/v1/search?keyword=xxx` - 搜索文章
- `GET /api/v1/articles/hot` - 获取热门文章

## 📝 开发指南

### 添加新功能

1. **后端** - 在 `app/controller/` 中添加控制器，在 `app/model/` 中添加模型
2. **前端** - 在 `frontend/src/pages/` 中添加页面，在 `frontend/src/components/` 中添加组件
3. **路由** - 在 `config/router.js` 和 `frontend/src/App.jsx` 中配置路由

### 数据库迁移

修改数据库结构后：
1. 更新 `init-db.js` 中的表定义
2. 运行 `npm run init-db` 重新初始化数据库

### Markdown 编辑

支持 GitHub Flavored Markdown 语法：

````markdown
# 标题

## 二级标题

- 列表项
- 列表项

**粗体** *斜体*

\```javascript
console.log('Hello World');
\```

[链接](https://example.com)
````

## 🏗️ 生产部署

### 后端部署

```bash
npm start
```

### 前端构建

```bash
cd frontend
npm run build
```

构建产物在 `frontend/dist` 目录，部署到 Nginx 或其他静态服务器。

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://localhost:7001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📋 待办事项

- [ ] 用户认证和权限管理
- [ ] 文章草稿自动保存
- [ ] 图片上传功能
- [ ] RSS 订阅
- [ ] SEO 优化
- [ ] 暗色主题
- [ ] 实时 Markdown 预览
- [ ] 文章导入/导出

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**Enjoy your blogging! 🚀**
>>>>>>> 605e55f86098a267201578ad64915999ae6eca31
