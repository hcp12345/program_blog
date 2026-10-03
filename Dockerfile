# syntax=docker/dockerfile:1

############################################################
# 后端服务镜像：Egg.js + Sequelize (Node 22)
# 构建：docker build -t md-blog-backend .
# 说明：数据库连接等配置全部通过环境变量注入（见 docker-compose.yml）
############################################################
FROM node:22-slim

# npm 源：国内构建默认走镜像站；如需官方源可传 --build-arg NPM_REGISTRY=https://registry.npmjs.org
ARG NPM_REGISTRY=https://registry.npmmirror.com

WORKDIR /app

# 运行环境变量
ENV NODE_ENV=production \
    EGG_SERVER_ENV=prod \
    EGG_WORKERS=1 \
    PORT=7001 \
    TZ=Asia/Shanghai

# 先复制依赖清单，利用 Docker 层缓存
COPY package*.json ./
RUN npm install --omit=dev --registry=${NPM_REGISTRY} \
    && npm cache clean --force

# 复制应用代码
COPY . .

EXPOSE 7001

# 容器健康检查：探测 /health
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=5 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||7001)+'/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# egg-scripts 前台启动（容器内禁止 daemon 模式，日志直接输出到 stdout）
CMD ["npm", "run", "start"]
