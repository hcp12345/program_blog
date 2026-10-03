# MD Blog 文档中心

MD Blog（个人博客系统）的完整文档索引。技术栈：**Egg.js + React (Vite) + MySQL + Markdown**。

## 📚 文档目录

| 文档 | 内容说明 |
| --- | --- |
| [架构设计](./architecture.md) | 系统整体架构、后端分层、前端结构、认证机制、目录说明 |
| [API 接口文档](./api.md) | 全部 REST API 端点、请求/响应示例、统一响应格式 |
| [数据库设计](./database.md) | 表结构、字段说明、模型关联关系（ER 图） |
| [开发指南](./development.md) | 环境搭建、日常开发流程、测试、生产部署、常见问题 |
| [AI 智能客服方案](./ai-agent.md) | AI Agent 技术选型、架构设计、实施计划（**已实施并验证**） |

## 🚀 快速上手（TL;DR）

```bash
# 1. 安装依赖
npm install
cd frontend && npm install && cd ..

# 2. 修改 config/config.default.js 中的 MySQL 密码，然后初始化数据库
npm run init-db

# 3. 一键启动前后端（后端 :7001，前端 :3000）
npm run dev:all
# 或者 Windows 下直接双击 dev.bat / Linux/Mac 执行 ./dev.sh
```

访问地址：

- 前台页面：<http://localhost:3000>
- 管理后台：<http://localhost:3000/admin>（需登录）
- 后端 API：<http://localhost:7001/api/v1>
- 健康检查：<http://localhost:7001/health>

## 🗺️ 阅读建议

- **想了解代码怎么组织的** → 先看 [架构设计](./architecture.md)
- **要对接接口 / 写前端调用** → 看 [API 接口文档](./api.md)
- **要加字段 / 改表结构** → 看 [数据库设计](./database.md)
- **要跑起来 / 上线** → 看 [开发指南](./development.md)

## ⚠️ 关于仓库中的 `src/` 与 `pom.xml`

仓库根目录下的 `src/`、`pom.xml`、`mvnw`、`.mvn/` 是一套早期的 Java Spring Boot 博客后端（遗留代码），与当前 Egg.js + React 技术栈的博客系统**无关**，不参与构建和运行，可忽略或择机清理。
