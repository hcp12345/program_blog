# API 接口文档

后端所有接口以 `/api/v1` 为前缀，默认监听 `http://localhost:7001`。

## 通用约定

### 统一响应格式

```json
// 成功
{ "success": true, "data": { ... } }
// 失败（配合 400/404/500 等状态码）
{ "success": false, "message": "错误描述" }
```

### 分页

列表类接口支持 `page`（默认 1）和 `pageSize`（默认 10）参数，响应 `data` 固定为：

```json
{ "list": [...], "total": 100, "page": 1, "pageSize": 10 }
```

### 认证

- 登录接口返回 JWT token（有效期 7 天）。
- 需要携带 token 的请求加请求头：`Authorization: Bearer <token>`。
- 当前中间件只解析 token 不强制拦截，但前端管理功能依赖登录态，建议所有写操作都带上 token。

---

## 文章 `/api/v1/articles`

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/v1/articles` | 文章列表（分页） |
| GET | `/api/v1/articles/search` | 同列表接口，支持 keyword 参数 |
| GET | `/api/v1/articles/hot` | 热门文章（按浏览量+点赞，Top 10） |
| GET | `/api/v1/articles/slug/:slug` | 按 slug 获取文章详情 |
| GET | `/api/v1/articles/:id` | 按 ID 获取文章详情 |
| POST | `/api/v1/articles` | 创建文章 |
| POST | `/api/v1/articles/batch-delete` | 批量删除文章 |
| PUT | `/api/v1/articles/:id` | 更新文章 |
| DELETE | `/api/v1/articles/:id` | 删除文章 |
| POST | `/api/v1/articles/:id/like` | 点赞文章 |

**列表查询参数**：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `page` | number | 页码，默认 1 |
| `pageSize` | number | 每页条数，默认 10 |
| `status` | string | `draft` / `published` / `archived` / `all`；**不传时默认只返回已发布文章**（管理后台传 `all` 查全部） |
| `categoryId` | number | 按分类筛选 |
| `keyword` | string | 按标题/内容模糊搜索 |

**创建/更新请求体**：

```json
{
  "title": "文章标题（必填）",
  "slug": "article-slug（必填，全局唯一）",
  "content": "Markdown 内容（必填）",
  "excerpt": "摘要（可选，默认取内容前 200 字）",
  "coverImage": "封面图 URL（可选）",
  "categoryId": 1,
  "tagIds": [1, 2],
  "status": "draft"
}
```

后端创建/更新时会用 `marked` + `highlight.js` 将 Markdown 渲染为 HTML 存入 `htmlContent`。列表接口不返回 `content` 与 `htmlContent`，详情接口返回完整内容。

**批量删除请求体**：`{ "ids": [1, 2, 3] }`

> 注意：路由注册顺序上 `batch-delete`、`hot`、`slug/:slug` 等固定路径都在 `:id` 之前，新增固定路径时也要保持这一顺序，否则会被 `:id` 吞掉。

**详情查询响应**（节选）：

```json
{
  "success": true,
  "data": {
    "id": 1, "title": "...", "slug": "...", "content": "...", "htmlContent": "...",
    "status": "published", "viewCount": 10, "likeCount": 2, "commentCount": 1,
    "category": { "id": 1, "name": "技术", "slug": "tech" },
    "tags": [{ "id": 1, "name": "React", "slug": "react", "color": "#61dafb" }],
    "author": { "id": 1, "username": "admin", "nickname": "管理员", "avatar": null }
  }
}
```

获取详情（按 id 或 slug）会自动使 `viewCount` +1。

---

## 分类 `/api/v1/categories`

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/v1/categories` | 分类列表 |
| GET | `/api/v1/categories/slug/:slug` | 按 slug 获取分类 |
| GET | `/api/v1/categories/:id` | 按 ID 获取分类 |
| POST | `/api/v1/categories` | 创建分类 |
| PUT | `/api/v1/categories/:id` | 更新分类 |
| DELETE | `/api/v1/categories/:id` | 删除分类 |

字段：`name`（唯一）、`slug`（唯一）、`description`、`icon`、`parentId`（支持多级）、`sort`（排序权重）。

---

## 标签 `/api/v1/tags`

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/v1/tags` | 标签列表 |
| GET | `/api/v1/tags/slug/:slug` | 按 slug 获取标签 |
| GET | `/api/v1/tags/:id` | 按 ID 获取标签 |
| POST | `/api/v1/tags` | 创建标签 |
| PUT | `/api/v1/tags/:id` | 更新标签 |
| DELETE | `/api/v1/tags/:id` | 删除标签 |

字段：`name`（唯一）、`slug`（唯一）、`description`、`color`（展示色，如 `#61dafb`）、`articleCount`（文章计数）。

---

## 评论 `/api/v1/comments`

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/v1/comments` | 评论列表（支持 `articleId`、`status` 筛选） |
| GET | `/api/v1/comments/:id` | 评论详情（含父评论与回复） |
| POST | `/api/v1/comments` | 创建评论 |
| PUT | `/api/v1/comments/:id` | 更新评论（通常用于审核状态流转） |
| DELETE | `/api/v1/comments/:id` | 删除评论 |
| POST | `/api/v1/comments/:id/like` | 点赞评论 |

**创建请求体**：

```json
{
  "content": "评论内容（必填）",
  "authorName": "昵称（必填）",
  "authorEmail": "邮箱（必填，校验格式）",
  "authorUrl": "个人网站（可选）",
  "articleId": 1,
  "parentId": null
}
```

- `parentId` 不为空时表示回复某条评论（嵌套回复）。
- 新评论默认 `status: 'pending'`（待审核），通过后台审核后变为 `approved` 才对前台可见；可选值：`pending` / `approved` / `rejected`。

---

## 搜索 `/api/v1/search`

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/v1/search?keyword=xxx&page=1&pageSize=10` | 全文搜索 |

在**已发布**文章的标题、内容、摘要中做 LIKE 模糊匹配，`keyword` 必填。

---

## 用户 `/api/v1/users`

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/v1/users/register` | 注册 |
| POST | `/api/v1/users/login` | 登录（支持用户名或邮箱） |
| GET | `/api/v1/users/me` | 获取当前登录用户 |
| PUT | `/api/v1/users/profile` | 修改个人资料 |
| PUT | `/api/v1/users/password` | 修改密码 |

**注册请求体**：

```json
{ "username": "3-20 位字符", "email": "合法邮箱", "password": "至少 6 位", "nickname": "可选，默认同用户名" }
```

服务端校验：用户名长度 3-20、密码 ≥ 6 位、邮箱格式；用户名与邮箱全局唯一。密码使用 bcrypt 加密存储，接口响应不含密码字段。

**登录请求体与响应**：

```json
// 请求
{ "username": "admin 或 admin@example.com", "password": "******" }
// 响应
{
  "success": true,
  "data": { "token": "<JWT>", "user": { "id": 1, "username": "admin", "role": "admin", "...": "..." } }
}
```

---

## AI 智能客服 `/api/v1/chat`

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| POST | `/api/v1/chat` | 游客 | 发送消息，**SSE 流式返回** |
| GET | `/api/v1/chat/sessions` | 本人 | 我的会话列表（登录用户按 userId，游客按 IP） |
| GET | `/api/v1/chat/sessions/:id/messages` | 本人 | 会话消息记录 |
| DELETE | `/api/v1/chat/sessions/:id` | 本人 | 删除会话及其消息 |
| GET | `/api/v1/chat/settings` | 管理员 | 读取智能客服配置 |
| PUT | `/api/v1/chat/settings` | 管理员 | 修改限流阈值 / 文章发布模式 |
| GET | `/api/v1/chat/admin/sessions` | 管理员 | 客服质检：全量会话检索（支持 `keyword`、`page`、`pageSize`） |

**对话请求体**：`{ "message": "有没有关于 React 的文章？", "sessionId": 1 }`（`sessionId` 可省略，省略时自动创建新会话）

**SSE 事件流**：

```
event: start   data: {"sessionId":1,"title":"有没有关于 React 的文章？"}
event: tool    data: {"name":"searchArticles","args":{"keyword":"React"}}
event: delta   data: {"text":"我"}
event: done    data: {"messageId":4,"sessionId":1,"tokens":130}
event: error   data: {"message":"抱歉，智能助手暂时不可用，请稍后再试。"}
```

**限流**：按 IP 统计当日 `user` 消息数，超过 `chat_settings.rate_limit_per_ip_per_day`（默认 50）返回 `429`；管理员不计数，设为 0 表示不限制。

**配置接口**：

```json
// PUT /api/v1/chat/settings  请求体（字段可选）
{ "rateLimitPerIpPerDay": 50, "draftPublishMode": "manual" }
// draftPublishMode: manual 存草稿等人工确认 / auto 直接发布
```

**Agent 可用工具**：游客 — `searchArticles`、`getArticle`、`listCategories`、`listTags`、`getHotArticles`；管理员额外 — `getSiteStats`、`createArticle`、`updateArticleStatus`、`listPendingComments`。

---

## 其他

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/health` | 健康检查，返回 `{ status: "ok", timestamp: ... }` |
| GET | `/` | Egg 默认欢迎页 |
