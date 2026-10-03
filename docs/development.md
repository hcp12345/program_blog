# 开发指南

## 1. 环境要求

| 依赖 | 版本 | 说明 |
| --- | --- | --- |
| Node.js | >= 18.0.0 | 后端 Egg.js 与前端 Vite 均依赖 |
| MySQL | >= 5.7 | 建议 8.0，字符集 utf8mb4 |
| npm | 随 Node | — |

## 2. 首次搭建

```bash
# 1. 安装后端依赖
npm install

# 2. 安装前端依赖
cd frontend && npm install && cd ..

# 3. 配置数据库：编辑 config/config.default.js
#    修改 config.sequelize 中的 password（默认 '123456'）、host、port 等

# 4. 初始化数据库（建表 + 示例数据，会清空已有数据）
npm run init-db
```

也可以不用 `init-db.js`，手动执行 `database.sql` 建库建表。

## 3. 启动开发环境

**方式一：一键并发启动（推荐）**

```bash
npm run dev:all   # concurrently 同时启动后端(:7001) 和前端(:3000)
```

**方式二：平台脚本**

- Windows：双击 `dev.bat`
- Linux/Mac：`./dev.sh`

**方式三：分别启动（两个终端）**

```bash
npm run dev                 # 后端，egg-bin dev，端口 7001
cd frontend && npm run dev  # 前端，vite，端口 3000
```

访问地址：

- 前台：<http://localhost:3000>
- 后台：<http://localhost:3000/admin>（需登录，示例管理员 `admin / admin123`）
- 后端 API：<http://localhost:7001/api/v1>
- 健康检查：<http://localhost:7001/health>

## 4. 环境变量

| 变量 | 说明 |
| --- | --- |
| `VITE_API_URL` | 前端（`frontend/.env`）：后端 API 地址；不设置时使用 `/api/v1` 相对路径（开发环境由 Vite 代理转发） |
| `ZHIPU_API_KEY` | **后端**：智谱开放平台 API Key，AI 智能客服必填；未设置时对话接口返回「智能客服尚未配置」 |
| `LLM_BASE_URL` | 可选，默认 `https://open.bigmodel.cn/api/paas/v4`（智谱 OpenAI 兼容端点）；切通义千问改为 `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| `LLM_MODEL` | 可选，默认 `glm-4-flash`（免费模型，支持工具调用） |

## 5. 常用命令速查

### 后端（根目录）

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 开发模式启动后端 |
| `npm run dev:all` | 同时启动前后端 |
| `npm run init-db` | 初始化数据库（⚠️ 清空数据） |
| `npm run lint` | ESLint 检查 |
| `npm test` | lint --fix + 运行测试 |
| `npm run test:local` | 仅运行 Egg 测试（egg-bin test） |
| `npm run cov` | 覆盖率测试 |
| `npm run ci` | lint + 覆盖率 |
| `npm start` | 生产模式守护进程启动（egg-scripts） |
| `npm run stop` | 停止生产守护进程 |

### 前端（frontend/）

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | Vite 开发服务器 |
| `npm run build` | 生产构建，产物在 `frontend/dist` |
| `npm run preview` | 本地预览构建产物 |
| `npm run lint` | ESLint 检查 |

## 6. 日常开发流程

### 后端新增功能

1. `app/model/` 创建/修改 Sequelize 模型（含 `associate` 关联）；
2. `app/controller/` 创建控制器，方法命名遵循 RESTful 约定（`index` / `show` / `create` / `update` / `destroy`）；
3. `config/router.js` 注册路由，注意**固定路径要放在 `:id` 这类参数路径之前**；
4. 逻辑复杂时抽到 `app/service/`（当前项目尚无 service 层）。

### 前端新增功能

1. `frontend/src/pages/` 新建页面，公共组件放 `components/`；
2. `frontend/src/App.jsx` 注册路由（后台页面用 `ProtectedRoute` 包裹）；
3. API 调用统一封装到 `frontend/src/services/api.js`，不要在组件里直接 `import axios`；
4. 需要登录态时使用 `contexts/AuthContext.jsx` 提供的 `useAuth()`。

### 数据库变更

见 [数据库设计](./database.md#修改表结构的流程)：模型 → init-db.js → 重新初始化。

## 7. 生产部署

### 后端

```bash
npm start   # egg-scripts 以守护进程启动，默认端口 7001
npm run stop
```

上线前务必检查：

- 修改 `config/config.default.js` 中的数据库密码；
- 更换 `config.keys` 与 `config.jwt.secret`（当前为默认值，**不能用于生产**）；
- 收紧 `config.cors.origin`（当前为 `*`）；
- 评估 `jwt_auth` 中间件：目前只解析不拦截，写接口建议增加强制登录/角色校验。

### 前端

```bash
cd frontend
npm run build
# 产物在 frontend/dist，交给 Nginx 等静态服务器托管
```

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

## 8. 已知问题与注意事项

| 问题 | 说明 |
| --- | --- |
| 需配置 LLM Key | AI 智能客服需要设置 `ZHIPU_API_KEY` 环境变量，否则对话返回「智能客服尚未配置」 |
| 免费模型限流 | 智谱免费模型有并发/频率上限，高峰可能返回 429（对话会提示「模型服务当前繁忙」），正式上线可换付费模型 |
| 写接口已强制鉴权 | `jwt_auth` 现对非白名单写操作返回 401；游客评论、点赞、AI 对话在白名单内 |
| 默认密钥 | `config.keys` 与 `jwt.secret` 是占位值，生产必须更换 |
| CORS 全开放 | 当前 `config.cors.origin` 为 `*`，上线前应收紧 |
| 遗留 Java 代码 | `src/`、`pom.xml` 等是早期 Spring Boot 版本遗留，与本项目无关，勿混淆 |
| 评论作者身份 | 评论使用昵称+邮箱的游客模式，未绑定注册用户 |

### 历史修复记录

- **管理员无法登录（已修复）**：`init-db.js` 原先写入明文密码，而登录接口使用 `bcrypt.compare` 校验，导致 admin 登录失败。现已改为写入 bcrypt 哈希；登录接口同时兼容旧明文密码并在首次成功登录后自动升级为哈希。
