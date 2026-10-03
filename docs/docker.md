# Docker 部署指南

> 在 Linux 服务器上一键启动完整服务：**MySQL + 后端(Egg.js) + 前端(Nginx)**。
> 亦可本地快速体验，无需安装 Node / MySQL。

## 1. 架构总览

```
                         ┌────────────────────────────────────┐
   浏览器 ──── :8080 ───▶ │ frontend  (nginx:1.27-alpine)      │
                         │   ├─ 静态资源 /assets（长缓存）      │
                         │   └─ /api/*  ──反代──┐              │
                         └─────────────────────┼──────────────┘
                                               │ 容器网络 md-blog-net
                                               ▼
                         ┌────────────────────────────────────┐
                         │ backend   (node:22-slim)           │
                         │   Egg.js :7001  ·  /health         │
                         └─────────────────────┬──────────────┘
                                               │
                                               ▼
                         ┌────────────────────────────────────┐
                         │ db        (mysql:8.0)              │
                         │   数据卷 md-blog-db-data            │
                         │   首次启动执行 database.sql         │
                         └────────────────────────────────────┘
```

- 仅 **frontend** 对外暴露端口（默认 `8080`）
- **backend** / **db** 只在容器网络内互通；db 的 `3307` 映射仅供本机调试

## 2. 文件清单

| 文件 | 说明 |
| --- | --- |
| `Dockerfile` | 后端镜像（Egg.js，Node 22 slim） |
| `.dockerignore` | 后端构建上下文排除规则 |
| `frontend/Dockerfile` | 前端镜像（Vite 构建 → Nginx 托管） |
| `frontend/nginx.conf` | Nginx 站点配置（SPA 回退 + API 反代 + SSE 直通） |
| `frontend/.dockerignore` | 前端构建上下文排除规则 |
| `docker-compose.yml` | 三服务编排 |
| `.env.example` | 环境变量模板 |
| `database.sql` | 建表 + 初始数据（容器首次启动自动执行） |

## 3. 前置要求

- Linux 服务器（或 Docker Desktop）
- Docker Engine ≥ 20.10
- Docker Compose **V2**（使用 `docker compose`，不是旧的 `docker-compose`）

## 4. 一键启动

```bash
# 1. 准备环境变量（至少修改数据库密码；生产环境请一并填写 APP_KEYS / JWT_SECRET）
cp .env.example .env
vi .env

# 2. 构建并启动（首次构建需几分钟）
docker compose up -d --build

# 3. 查看状态与日志
docker compose ps
docker compose logs -f backend
```

启动顺序由健康检查保证：**db 健康 → backend 启动 → frontend 启动**。

## 5. 访问入口

| 入口 | 地址 |
| --- | --- |
| 前台页面 | `http://<服务器IP>:8080` |
| 管理后台 | `http://<服务器IP>:8080/admin` |
| 健康检查 | `http://<服务器IP>:8080/health` |
| API | `http://<服务器IP>:8080/api/v1` |

默认管理员：`admin / admin123`（**登录后请立即修改密码**）。

## 6. 常用命令

```bash
docker compose up -d --build        # 构建并后台启动
docker compose ps                   # 查看服务状态
docker compose logs -f backend      # 实时查看后端日志（日志直接输出到控制台）
docker compose logs -f frontend     # 查看 Nginx 日志
docker compose restart backend      # 重启后端
docker compose up -d --build backend # 仅重建后端（改了后端代码/配置后）
docker compose down                 # 停止并移除容器（保留数据卷）
docker compose down -v              # ⚠️ 连数据卷一起删除（清空数据库）
```

## 7. 环境变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `WEB_PORT` | `8080` | 前端对外端口 |
| `DB_EXPOSE_PORT` | `3307` | 数据库映射到宿主机的端口（调试用，可删） |
| `DB_NAME` | `md_me_blog` | 数据库名 |
| `DB_USER` / `DB_PASSWORD` | `root` / `123456` | 数据库账号密码（**生产必须修改**） |
| `EGG_WORKERS` | `1` | 后端 worker 进程数 |
| `APP_KEYS` | 空 | Egg cookie 签名密钥（生产必填，`openssl rand -hex 32`） |
| `JWT_SECRET` | 空 | JWT 签名密钥（生产必填） |
| `ZHIPU_API_KEY` | 空 | 智谱 GLM Key（AI 客服需要） |
| `LLM_BASE_URL` / `LLM_MODEL` | 智谱地址 / `glm-4-flash` | 切换其他 OpenAI 兼容模型时修改 |

> 所有密钥均通过环境变量注入，仓库代码中不含任何密钥。

## 8. 数据库初始化

- `database.sql` 被挂载到 MySQL 的 `/docker-entrypoint-initdb.d/`，**仅在数据卷首次创建时执行一次**
- 执行内容：建库 → 9 张表 → 初始数据（管理员、示例分类/标签/欢迎文章、智能客服默认配置）
- 需要重新初始化：`docker compose down -v` 后再 `up`

## 9. 数据持久化与备份

- MySQL 数据保存在命名卷 `md-blog-db-data`
- 备份：

```bash
docker exec md-blog-db sh -c 'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" md_me_blog' > backup.sql
```

- 恢复：

```bash
docker exec -i md-blog-db sh -c 'exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD" md_me_blog' < backup.sql
```

## 10. 生产注意事项

1. **必改**：`DB_PASSWORD`、`APP_KEYS`、`JWT_SECRET`
2. **收紧 CORS**：`config/config.default.js` 中 `config.cors.origin` 当前为 `*`，建议改为你的域名后重建后端
3. **HTTPS**：建议在 frontend 之前再挂一层 Nginx / Caddy 处理证书，或使用云负载均衡
4. **构建加速**：Dockerfile 默认使用 npmmirror 源；如需官方源可用 `--build-arg NPM_REGISTRY=https://registry.npmjs.org`
5. **日志**：后端日志直接输出到容器 stdout，可用 `docker compose logs` 查看，也支持接入 Loki / ELK

## 11. 常见问题

**Q：端口 8080 被占用？**
修改 `.env` 中的 `WEB_PORT`，然后 `docker compose up -d`。

**Q：后端日志报 `Unknown column 'Article.createdAt'`？**
数据库是用旧版 `database.sql`（下划线时间戳）初始化的。执行 `docker compose down -v && docker compose up -d --build` 重新初始化即可。

**Q：AI 对话提示「智能客服尚未配置」？**
在 `.env` 中填写 `ZHIPU_API_KEY`，然后 `docker compose up -d backend` 让后端重建。

**Q：修改了 `database.sql` 却不生效？**
初始化脚本只在数据卷首次创建时执行，需 `docker compose down -v` 重置后重新启动。

**Q：页面能打开，但接口返回 502？**
后端未就绪或启动失败。`docker compose logs -f backend` 查看错误；确认 db 健康检查已通过。

**Q：AI 回答不是流式输出（一次性出现）？**
`frontend/nginx.conf` 已针对 `/api/` 关闭了 `proxy_buffering`。若你在前面又套了一层反向代理，需同样关闭缓冲。
