# MD Blog - 个人博客系统

基于 Egg.js + React (Vite) + MySQL + Markdown 的现代化个人博客系统。

> 📚 **完整文档** 见 [docs/](./docs) 目录：[架构设计](./docs/architecture.md) · [API 接口文档](./docs/api.md) · [数据库设计](./docs/database.md) · [开发指南](./docs/development.md) · [Docker 部署](./docs/docker.md)

## ✨ 功能特性

- ✅ **文章管理** - 创建、编辑、删除、批量删除、发布、置顶文章
- ✅ **Markdown 编辑** - 支持 GitHub Flavored Markdown，服务端（marked + highlight.js）与客户端（react-markdown）双重渲染
- ✅ **分类系统** - 支持多级分类（parentId 自关联）
- ✅ **标签系统** - 文章标签多对多关联，支持自定义颜色
- ✅ **评论系统** - 游客评论、嵌套回复、审核流转（待审核/通过/拒绝）、点赞
- ✅ **用户系统** - 注册 / 登录（JWT + bcrypt）、个人资料与密码管理
- ✅ **管理后台** - 文章 / 分类 / 标签 / 评论管理，登录保护（前端路由守卫 + 后端强制鉴权）
- ✅ **AI 智能客服** - 接入智谱 GLM，前台右下角对话找文章，后台可对话查统计、生成文章；支持按 IP 限流、发布模式配置、对话质检
- ✅ **全文搜索** - 标题、内容、摘要模糊搜索 + 热门文章榜单
- ✅ **响应式设计** - 基于 TailwindCSS

## 🚀 快速开始

### 🐳 Docker 一键启动（推荐，无需安装 Node / MySQL）

```bash
cp .env.example .env        # 按需修改数据库密码 / 端口 / AI Key
docker compose up -d --build
```

启动完成后访问：

- 前台 / 后台：<http://localhost:8080> 、<http://localhost:8080/admin>
- API / 健康检查：<http://localhost:8080/api/v1> 、<http://localhost:8080/health>

编排包含 **MySQL + 后端 + 前端** 三个服务，数据库在首次启动时自动建表并写入初始数据。
完整说明（环境变量、数据备份、常见问题）见 **[docs/docker.md](./docs/docker.md)**。

---

### 本地开发（Node + MySQL）：环境要求

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
  password: '123456',  // 修改为你的 MySQL 密码
  // ...
};
```

### 3. 初始化数据库

```bash
npm run init-db
```

这将创建数据库、表结构并插入示例数据（⚠️ 会清空现有数据）。示例管理员账号：`admin / admin123`。

### 4. 启动开发环境

#### 方式一：一键启动（推荐）

```bash
npm run dev:all   # concurrently 同时启动前后端
```

#### 方式二：使用启动脚本

- Windows: `dev.bat`
- Linux/Mac: `./dev.sh`

#### 方式三：分别启动

```bash
# 终端 1 - 启动后端服务
npm run dev

# 终端 2 - 启动前端服务
cd frontend
npm run dev
```

### 5. 访问应用

- **前台页面**: http://localhost:3000
- **后台管理**: http://localhost:3000/admin
- **后端 API**: http://localhost:7001/api/v1
- **健康检查**: http://localhost:7001/health

### 6. 启用 AI 智能客服（可选）

前端浮窗与后台「AI 助手」需要配置智谱开放平台的 API Key：

```bash
# Windows PowerShell
$env:ZHIPU_API_KEY="你的Key"; npm run dev:all
# Linux / macOS
export ZHIPU_API_KEY="你的Key" && npm run dev:all
```

默认使用免费模型 `glm-4-flash`。未配置 Key 时其他功能不受影响，仅对话会提示「智能客服尚未配置」。
限流阈值与文章发布模式可在后台「智能客服配置」中调整。详见 [docs/ai-agent.md](./docs/ai-agent.md)。

## 📁 项目结构

```
program_blog/
├── app/                        # 后端应用目录（Egg.js 约定）
│   ├── controller/             # 控制器（业务逻辑在此层）
│   │   ├── article.js          # 文章 CRUD / slug 查询 / 点赞 / 批量删除
│   │   ├── category.js         # 分类 CRUD
│   │   ├── comment.js          # 评论 CRUD / 审核 / 点赞
│   │   ├── search.js           # 全文搜索 / 热门文章
│   │   ├── tag.js              # 标签 CRUD
│   │   ├── user.js             # 注册 / 登录 / 资料 / 密码
│   │   ├── chat.js             # AI 客服：SSE 对话 / 会话 / 限流 / 配置 / 质检
│   │   └── home.js             # 默认欢迎页
│   ├── model/                  # Sequelize 模型
│   │   ├── article.js          # 文章（关联分类/标签/评论/作者）
│   │   ├── category.js         # 分类（支持多级）
│   │   ├── tag.js              # 标签（多对多）
│   │   ├── comment.js          # 评论（嵌套自关联）
│   │   ├── user.js             # 用户
│   │   └── chatSession.js / chatMessage.js / chatSetting.js  # AI 客服三表
│   ├── service/
│   │   ├── agent.js            # Agent 循环（智谱 GLM 流式 + 工具调用）
│   │   └── agentTools.js       # 工具注册表（按角色下发）
│   └── middleware/
│       └── jwt_auth.js         # JWT 解析 + 写操作强制鉴权（含游客白名单）
├── config/
│   ├── config.default.js       # 应用配置（数据库/CORS/JWT/LLM/中间件）
│   └── plugin.js               # Egg 插件开关（sequelize/cors/validate/jwt）
├── app/router.js               # 路由注册（所有 /api/v1 端点）
├── frontend/                   # 前端应用（React 19 + Vite）
│   └── src/
│       ├── App.jsx             # 路由表
│       ├── components/         # Header / Footer / SearchBar / ProtectedRoute
│       │                       # ChatWidget（浮窗） / ChatPanel（对话面板）
│       ├── contexts/
│       │   └── AuthContext.jsx # 全局登录态（localStorage 持久化）
│       ├── layouts/            # MainLayout（前台）/ AdminLayout（后台）
│       ├── pages/
│       │   ├── HomePage.jsx / ArticleListPage.jsx / ArticleDetailPage.jsx
│       │   ├── ArticleEditor.jsx / SearchPage.jsx
│       │   ├── LoginPage.jsx / RegisterPage.jsx
│       │   └── admin/          # ArticleManagement / CategoryManagement
│       │                       # TagManagement / CommentManagement
│       │                       # AssistantPage（AI 助手）/ ChatSettings / ChatQuality
│       └── services/
│           └── api.js          # axios 封装 + 各资源 API + SSE 流式对话
├── init-db.js                  # 数据库初始化脚本
├── database.sql                # 建库建表 SQL（Docker 首次启动自动执行）
├── dev.bat / dev.sh            # Windows / Linux-Mac 启动脚本
├── Dockerfile                  # 后端镜像（Egg.js）
├── docker-compose.yml          # 一键编排：MySQL + 后端 + 前端
├── .env.example                # Docker 环境变量模板
├── frontend/Dockerfile         # 前端镜像（Vite 构建 + Nginx）
├── frontend/nginx.conf         # Nginx 站点配置（静态托管 + API 反代）
└── docs/                       # 项目文档
```

> ℹ️ 仓库根目录的 `src/`、`pom.xml`、`mvnw` 是早期 Java (Spring Boot) 版本的遗留代码，与当前系统无关，可忽略。

## 🎨 技术栈

### 后端
- **Egg.js 3** - 企业级 Node.js 框架
- **MySQL**（mysql2 驱动）- 关系型数据库
- **egg-sequelize** - ORM 框架
- **egg-jwt + jsonwebtoken + bcryptjs** - JWT 认证与密码加密
- **Marked + Highlight.js** - 服务端 Markdown 解析和代码高亮
- **egg-cors / egg-validate** - 跨域支持 / 参数验证

### 前端
- **React 19** - UI 框架
- **Vite 7** - 快速构建工具
- **React Router 7** - 路由管理
- **Axios** - HTTP 客户端（统一封装于 `services/api.js`）
- **TailwindCSS 3** - 原子化样式
- **react-markdown**（remark-gfm / remark-breaks / remark-directive + rehype-highlight / rehype-raw / rehype-sanitize）- Markdown 渲染管线
- **@mdxeditor/editor** - 富文本式 Markdown 编辑器

### AI 智能客服
- **智谱 GLM**（OpenAI 兼容接口，默认免费模型 `glm-4-flash`，备选通义千问）- 对话与函数调用
- **Function Calling** - 工具复用站内业务逻辑（搜索文章、统计、建文章等），非直接操作数据库
- **SSE** - 服务端推送流式回答
- **会话存储** - MySQL 三表（chat_sessions / chat_messages / chat_settings）

## 🔌 API 接口

完整文档（含请求/响应示例）见 [docs/api.md](./docs/api.md)，以下为端点速览。

### 文章相关
- `GET /api/v1/articles` - 获取文章列表（分页，默认只返回已发布）
- `GET /api/v1/articles/hot` - 热门文章 Top 10
- `GET /api/v1/articles/slug/:slug` - 根据 slug 获取文章
- `GET /api/v1/articles/:id` - 获取文章详情
- `POST /api/v1/articles` - 创建文章
- `POST /api/v1/articles/batch-delete` - 批量删除文章
- `PUT /api/v1/articles/:id` - 更新文章
- `DELETE /api/v1/articles/:id` - 删除文章
- `POST /api/v1/articles/:id/like` - 点赞文章

### 分类相关
- `GET /api/v1/categories` - 获取所有分类
- `GET /api/v1/categories/slug/:slug` / `GET /api/v1/categories/:id` - 分类详情
- `POST /api/v1/categories` / `PUT /api/v1/categories/:id` / `DELETE /api/v1/categories/:id` - 分类写操作

### 标签相关
- `GET /api/v1/tags` - 获取所有标签
- `GET /api/v1/tags/slug/:slug` / `GET /api/v1/tags/:id` - 标签详情
- `POST /api/v1/tags` / `PUT /api/v1/tags/:id` / `DELETE /api/v1/tags/:id` - 标签写操作

### 评论相关
- `GET /api/v1/comments` - 评论列表（支持 articleId、status 筛选）
- `GET /api/v1/comments/:id` - 评论详情（含父评论与回复）
- `POST /api/v1/comments` - 创建评论（默认待审核）
- `PUT /api/v1/comments/:id` - 更新评论（审核流转）
- `DELETE /api/v1/comments/:id` - 删除评论
- `POST /api/v1/comments/:id/like` - 点赞评论

### 搜索相关
- `GET /api/v1/search?keyword=xxx` - 搜索已发布文章
- `GET /api/v1/articles/hot` - 热门文章

### 用户相关
- `POST /api/v1/users/register` - 注册（bcrypt 加密）
- `POST /api/v1/users/login` - 登录（支持用户名或邮箱），返回 JWT
- `GET /api/v1/users/me` - 当前登录用户
- `PUT /api/v1/users/profile` - 修改资料
- `PUT /api/v1/users/password` - 修改密码

### 其他
- `GET /health` - 健康检查

### AI 智能客服相关
- `POST /api/v1/chat` - 发送消息（SSE 流式返回，游客可用，按 IP 限流）
- `GET /api/v1/chat/sessions` - 我的会话列表
- `GET /api/v1/chat/sessions/:id/messages` - 会话消息记录
- `DELETE /api/v1/chat/sessions/:id` - 删除会话
- `GET /api/v1/chat/settings` / `PUT /api/v1/chat/settings` - 智能客服配置（管理员）
- `GET /api/v1/chat/admin/sessions` - 客服质检：全量会话检索（管理员）

## 📝 开发指南

### 添加新功能

1. **后端** - 在 `app/model/` 添加模型，`app/controller/` 添加控制器（RESTful 方法名：`index/show/create/update/destroy`），在 `app/router.js` 注册路由（固定路径需放在 `:id` 参数路径**之前**）
2. **前端** - 在 `frontend/src/pages/` 添加页面，在 `frontend/src/App.jsx` 配置路由，API 调用统一封装到 `frontend/src/services/api.js`
3. **数据库** - 变更表结构时：模型 → `init-db.js` → 重新 `npm run init-db`（会清空数据，注意备份）

更多细节见 [docs/development.md](./docs/development.md)。

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

### 🐳 Docker 部署（推荐）

```bash
cp .env.example .env        # 修改数据库密码 / 密钥 / AI Key
docker compose up -d --build
```

一键拉起 MySQL + 后端 + 前端，完整说明见 **[docs/docker.md](./docs/docker.md)**。

### 后端部署（非 Docker）

```bash
npm start             # egg-scripts 启动（前台控制台模式，日志直接可见）
npm run start:daemon  # 需要后台常驻时使用
npm run stop          # 停止后台实例
```

> ⚠️ 上线前必须：更换 `config.keys` 与 `config.jwt.secret`（当前为默认值）、修改数据库密码、收紧 CORS（当前为 `*`）、设置 `ZHIPU_API_KEY`。

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

- [x] 生产环境配置抽离（已支持环境变量注入 `DB_*` / `APP_KEYS` / `JWT_SECRET`，并提供 Docker 一键部署）
- [ ] 文章草稿自动保存
- [ ] 图片上传功能
- [ ] RSS 订阅
- [ ] SEO 优化
- [ ] 暗色主题
- [ ] 实时 Markdown 预览
- [ ] 文章导入/导出
- [ ] 智能客服：会话标题自动生成、回答中内嵌文章引用卡片
- [ ] 文章量增长后为智能客服引入向量检索（RAG）

## 🧹 遗留代码

根目录下的 `src/`（Java 源码）、`pom.xml`、`mvnw`、`.mvn/` 等属于早期 Spring Boot + MyBatis 版本，已被 Egg.js 方案取代，确认无用后可删除。

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**Enjoy your blogging! 🚀**
