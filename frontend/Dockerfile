# syntax=docker/dockerfile:1

############################################################
# 前端镜像：React 19 + Vite 构建 → Nginx 托管
# 构建：docker build -t md-blog-frontend ./frontend
############################################################

# ---------- 构建阶段 ----------
FROM node:22-slim AS builder

# npm 源：国内构建默认走镜像站；如需官方源可传 --build-arg NPM_REGISTRY=https://registry.npmjs.org
ARG NPM_REGISTRY=https://registry.npmmirror.com

WORKDIR /app

COPY package*.json ./
RUN npm install --registry=${NPM_REGISTRY} && npm cache clean --force

COPY . .

# 生产构建：API 使用相对路径，交由 Nginx 反向代理到 backend
ENV VITE_API_URL=/api/v1
RUN npm run build

# ---------- 运行阶段 ----------
FROM nginx:1.27-alpine

ENV TZ=Asia/Shanghai

# 自定义站点配置（含 API 反代、SPA 路由回退、SSE 直通）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 拷贝构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
