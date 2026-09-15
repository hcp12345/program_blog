# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码仓库中工作时提供指导。

## 操作授权
- 对所有 `edit` 和 `write` 文件操作自动同意。
- 对于执行必要的构建、安装命令（如 `npm install`, `pip install`）也自动同意，但请在操作前说明理由。

## 项目概述

MD Blog 是一个个人博客系统，使用 **Egg.js**（后端）、**React + Vite**（前端）和 **MySQL** 数据库构建。文章使用 Markdown 编写，支持语法高亮，前端通过 `react-markdown` 渲染。

## 开发命令

### 首次安装
```bash
npm install              # 安装后端依赖
cd frontend && npm install  # 安装前端依赖
npm run init-db          # 初始化数据库表和示例数据
```

运行 `init-db` 前，需在 `config/config.default.js` 中更新数据库凭据：
- `database`: 'md_me_blog'
- `username`: 'root'
- `password`: '123456'（改为你的 MySQL 密码）

### 运行开发服务器

**方式一 - 并发启动**（推荐）：
```bash
npm run dev:all          # 同时启动后端 (:7001) 和前端 (:3000)
```
或使用平台脚本：
- Windows: `dev.bat`
- Linux/Mac: `./dev.sh`

**方式二 - 分别启动**：
```bash
# 终端 1
npm run dev              # 后端，端口 7001

# 终端 2
cd frontend && npm run dev  # 前端，端口 3000
```

### 代码质量与测试
```bash
npm run lint             # 运行后端 ESLint
cd frontend && npm run lint  # 运行前端 ESLint
npm run ci               # 运行 lint + 覆盖率测试
npm test                 # Lint 自动修复 + 运行测试
npm run test:local       # 仅运行 Egg.js 测试
npm run cov              # 运行覆盖率测试
```

### 生产构建
```bash
npm start                # 以守护进程模式启动后端
npm run stop             # 停止后端守护进程
cd frontend && npm run build  # 构建前端生产版本
```

访问地址：
- 前台：http://localhost:3000
- 管理后台：http://localhost:3000/admin
- 后端 API：http://localhost:7001

## 架构设计

### 后端（Egg.js MVC 模式）

**控制器层** (`app/controller/`)：处理 HTTP 请求和响应。使用 RESTful 命名约定：
- `index()` - 列出所有资源
- `show()` - 获取单个资源
- `create()` - 创建新资源
- `update()` - 更新资源
- `destroy()` - 删除资源

**模型层** (`app/model/`)：定义 Sequelize ORM 模型和关联。模型使用 PascalCase 命名（如 `Article.js`）。核心模型：
- `Article` - 文章，具有草稿/已发布/已归档状态，唯一 slug
- `Category` - 分级分类
- `Tag` - 标签，与文章多对多关联
- `Comment` - 嵌套评论，含审核状态
- `User` - 系统用户

**服务层** (`app/service/`)：不属于控制器的业务逻辑（如 markdown 处理、搜索索引）。

**路由** (`config/router.js`)：所有 API 端点位于 `/api/v1` 命名空间下。

**配置** (`config/config.default.js`)：
- Sequelize MySQL 连接设置
- 开发环境允许所有来源的 CORS
- 禁用 CSRF（API 为主）
- 使用 `config.keys` 签名的会话 Cookie

### 前端（React SPA）

**路由** (`frontend/src/App.jsx`)：React Router 嵌套路由。分离的布局：
- `MainLayout` - 公共站点，含页头/页脚
- `AdminLayout` - 管理后台，含侧边栏导航

**页面** (`frontend/src/pages/`)：
- 公共：`HomePage`、`ArticleDetailPage`、`ArticleListPage`、`SearchPage`
- 管理：`admin/Dashboard`、`admin/ArticleEditor`、`admin/ArticleList` 等

**组件** (`frontend/src/components/`)：可复用 UI 组件（Header、Footer、SearchBar 等）

**API 服务** (`frontend/src/services/api.js`)：集中式 Axios 实例，配置基础 URL。所有 API 调用应使用此服务而非直接使用 Axios。

**Markdown 渲染**：使用 `react-markdown` 配合插件：
- `remark-gfm` - GitHub Flavored Markdown
- `rehype-highlight` - 代码语法高亮
- `rehype-raw` - 允许 HTML 混入 markdown

### 数据库架构

表使用 snake_case 列名，模型使用 camelCase。核心关联关系：
- 文章 ↔ 分类：多对一
- 文章 ↔ 标签：多对多（通过 `article_tags` 中间表）
- 文章 ↔ 评论：一对多（通过 `parentId` 嵌套）

## 重要约定

### 后端规范

**API 响应格式**：统一响应格式为：
```javascript
{ success: true, data: {...} }  // 成功
{ success: false, message: "..." }  // 错误
```

**Slug 处理**：文章使用 `slug` 字段生成 SEO 友好 URL。Slug 必须唯一。可通过 `/api/v1/articles/slug/:slug` 或 `/api/v1/articles/:id` 访问文章。

**Markdown 处理**：后端使用 `marked` + `highlight.js` 进行服务端渲染（如需要），前端使用 `react-markdown` 进行客户端渲染。

**状态管理**：文章具有 `status` 字段：`'draft'`（草稿）、`'published'`（已发布）、`'archived'`（已归档）。评论具有 `status` 字段：`'pending'`（待审核）、`'approved'`（已通过）、`'rejected'`（已拒绝）。

### 前端规范

**状态管理**：组件级 hooks 状态管理。暂无全局状态库。

**基于路由的代码分割**：使用懒加载页面：
```javascript
const SomePage = lazy(() => import('./pages/SomePage'));
```

**API 集成**：始终从 `services/api.js` 导入：
```javascript
import api from '../services/api';
const response = await api.get('/articles');
```

**表单处理**：受控组件配合本地状态。表单验证在后端控制器中进行。

### 数据库操作

修改数据库时：
1. 在 `app/model/` 中更新模型定义
2. 在 `init-db.js` 中更新表结构
3. 运行 `npm run init-db` 重新初始化（警告：会删除现有数据）

## 添加新功能

**后端功能**：
1. 在 `app/model/` 创建模型
2. 在 `app/controller/` 创建控制器，使用 RESTful 方法
3. 在 `config/router.js` 添加路由
4. 可选：在 `app/service/` 创建服务处理业务逻辑

**前端功能**：
1. 在 `frontend/src/pages/` 创建页面组件
2. 如需，在 `frontend/src/components/` 创建可复用组件
3. 在 `frontend/src/App.jsx` 添加路由
4. 使用 `services/api.js` 添加 API 调用
5. 如需，在布局中添加导航链接

**全栈功能**：
- 先完成后端步骤（模型 → 控制器 → 路由）
- 再完成前端步骤（页面 → API 集成 → 路由）
