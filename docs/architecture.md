# 架构设计

## 1. 整体架构

```
┌─────────────────────────────────────────────────┐
│  浏览器                                          │
│  React 19 SPA (Vite 构建, :3000)                 │
│  ├── 前台：首页 / 文章列表 / 详情 / 搜索          │
│  └── 后台：/admin 文章·分类·标签·评论管理         │
└──────────────────┬──────────────────────────────┘
                   │ HTTP (开发环境走 Vite 代理)
┌──────────────────▼──────────────────────────────┐
│  Egg.js 后端 (:7001)                             │
│  ├── middleware/jwt_auth.js   JWT 解析中间件      │
│  ├── controller/              控制器 (RESTful)   │
│  ├── model/                   Sequelize 模型     │
│  └── config/router.js         /api/v1 路由注册   │
└──────────────────┬──────────────────────────────┘
                   │ Sequelize ORM
┌──────────────────▼──────────────────────────────┐
│  MySQL (md_me_blog, utf8mb4)                     │
│  users / articles / categories / tags /          │
│  comments / article_tags                         │
└─────────────────────────────────────────────────┘
```

- **开发环境**：前端 Vite dev server 跑在 3000 端口，API 请求以 `/api/v1` 相对路径发出，由 Vite 代理转发到后端 7001 端口；也可通过 `VITE_API_URL` 环境变量指定完整后端地址（见 `frontend/.env.example`）。
- **生产环境**：前端构建为静态资源（`frontend/dist`）由 Nginx 托管，`/api` 反向代理到后端。

## 2. 后端（Egg.js MVC）

### 2.1 分层职责

| 层 | 目录 | 职责 |
| --- | --- | --- |
| 路由 | `config/router.js` | 注册所有 `/api/v1/*` 端点，绑定控制器方法 |
| 中间件 | `app/middleware/jwt_auth.js` | 解析 `Authorization: Bearer <token>`，将用户信息挂到 `ctx.state.user` |
| 控制器 | `app/controller/` | 参数校验、业务调度、统一响应格式输出 |
| 模型 | `app/model/` | Sequelize 模型定义与 `associate` 关联 |
| 配置 | `config/config.default.js` | 数据库、CORS、JWT、安全等配置 |

当前项目**没有独立的 service 层**，业务逻辑都写在控制器里（如 Markdown 渲染）。逻辑复杂后可按 Egg 约定抽到 `app/service/`。

### 2.2 控制器清单

| 控制器 | 说明 |
| --- | --- |
| `article.js` | 文章 CRUD、按 slug 查询、点赞、批量删除；内含 marked + highlight.js 的 Markdown 服务端渲染 |
| `category.js` | 分类 CRUD、按 slug 查询 |
| `tag.js` | 标签 CRUD、按 slug 查询 |
| `comment.js` | 评论 CRUD、嵌套回复（parentId）、点赞、审核状态流转 |
| `search.js` | 关键词全文搜索（LIKE）、热门文章（按浏览量/点赞排序） |
| `user.js` | 注册（bcrypt 加密）、登录（JWT 签发）、当前用户、资料修改、密码修改 |
| `chat.js` | AI 智能客服：SSE 流式对话、会话管理、按 IP 限流、配置读写、客服质检 |
| `home.js` | 默认欢迎页 |

### 2.3 认证机制

- 使用 `egg-jwt` 插件 + 自定义 `jwt_auth` 中间件。
- 登录成功后端签发 JWT（有效期 7 天，密钥在 `config.jwt.secret`），payload 含 `userId` / `username` / `role`；前端存入 `localStorage`。
- `jwt_auth` 中间件两步：
  1. 解析 `Authorization: Bearer <token>`，解码结果挂到 `ctx.state.user`（无效/缺失置 `null`）；
  2. **强制鉴权**：非白名单的写操作（POST/PUT/DELETE/PATCH）若无有效 token 直接返回 401。
- 白名单分两类：写操作白名单（注册、登录，精确匹配）与**游客交互白名单**（发表评论、文章/评论点赞、AI 对话，正则匹配），保证前台游客功能不受影响。
- 管理员专属接口（如智能客服配置、质检）在控制器内二次校验 `ctx.state.user.role === 'admin'`，返回 403。

> ⚠️ 上线前仍需处理：`config.keys` 与 JWT secret 使用了默认值；CORS 允许所有来源。

### 2.4 统一响应格式

```javascript
// 成功
{ success: true, data: { ... } }
// 失败（配合 4xx/5xx 状态码）
{ success: false, message: "错误描述" }
```

列表类接口的 `data` 结构固定为 `{ list, total, page, pageSize }`。

## 3. 前端（React SPA）

### 3.1 技术栈

- **React 19 + Vite 7**：UI 与构建
- **React Router v7**：路由（`frontend/src/App.jsx` 集中定义）
- **TailwindCSS 3**：原子化样式（PostCSS 集成）
- **axios**：HTTP 客户端（`src/services/api.js` 统一封装）
- **react-markdown + remark-gfm / remark-breaks / remark-directive + rehype-highlight / rehype-raw / rehype-sanitize**：Markdown 渲染管线
- **@mdxeditor/editor**：文章编辑器

### 3.2 目录结构与职责

```
frontend/src/
├── main.jsx                 # 入口，挂载 AuthProvider + Router
├── App.jsx                  # 路由表（前台/登录注册/后台三块）
├── layouts/
│   ├── MainLayout.jsx       # 前台布局（Header + Footer）
│   └── AdminLayout.jsx      # 后台布局（侧边栏导航）
├── pages/
│   ├── HomePage.jsx         # 首页
│   ├── ArticleListPage.jsx  # 文章列表（也复用于分类/标签归档页）
│   ├── ArticleDetailPage.jsx# 文章详情（slug 路由）
│   ├── ArticleEditor.jsx    # 新建/编辑文章
│   ├── SearchPage.jsx       # 搜索页
│   ├── LoginPage.jsx        # 登录
│   ├── RegisterPage.jsx     # 注册
│   └── admin/
│       ├── ArticleManagement.jsx   # 文章管理（含批量删除）
│       ├── CategoryManagement.jsx  # 分类管理
│       ├── TagManagement.jsx       # 标签管理
│       └── CommentManagement.jsx   # 评论管理（审核）
├── components/
│   ├── Header.jsx / Footer.jsx / SearchBar.jsx
│   └── ProtectedRoute.jsx   # 路由守卫：未登录跳转 /login
├── contexts/
│   └── AuthContext.jsx      # 全局认证状态：token/user 持久化到 localStorage
└── services/
    └── api.js               # axios 实例 + articleApi/categoryApi/tagApi/commentApi/searchApi
```

### 3.3 认证流程（前端）

1. 登录成功 → token 与用户信息写入 `localStorage`，并设置 axios 默认 `Authorization` 头。
2. 刷新页面时 `AuthContext` 从 `localStorage` 恢复登录态。
3. `/admin/*` 路由被 `ProtectedRoute` 包裹，未登录重定向到 `/login`。

## 4. AI 智能客服（Blog Agent）

在原有 MVC 之上叠加的一条链路，详细方案见 [AI 智能客服方案](./ai-agent.md)：

```
前端 ChatWidget / 后台助手页
   │ POST /api/v1/chat (SSE)
controller/chat.js ── 限流(IP/日) · 会话存取 · 权限判定(guest/admin)
   │
service/agent.js  ── Agent 循环：调 LLM → 执行工具 → 回填 → 再调，最多 5 轮
   │        │
   │        └── service/agentTools.js 工具注册表（按角色下发）
   │                只读: searchArticles / getArticle / listCategories / listTags / getHotArticles
   │                仅管理员: getSiteStats / createArticle / updateArticleStatus / listPendingComments
   └── 智谱 GLM（OpenAI 兼容流式接口，模型可换）
```

核心设计：

- **工具复用业务逻辑**：工具执行体直接查/写 Sequelize 模型，与后台管理走同一套规则，AI 不生成 SQL。
- **角色降权**：游客只拿到只读工具；管理员才有写工具，且写入前要求 AI 复述确认。
- **配置可调**：限流阈值与文章发布模式存 `chat_settings` 表，后台可视化调整，即时生效。
- **质检留痕**：`chat_messages` 记录 user / assistant / tool 三类消息，后台可按关键词检索。

## 5. 遗留代码说明

仓库根目录的 `src/`（Java 源码）、`pom.xml`、`mvnw`、`.mvn/`、`src/main/resources/mapper/` 等是一套早期基于 **Spring Boot + MyBatis** 的博客后端遗留代码，与当前系统无关，不影响构建运行，可在确认无用后删除。
