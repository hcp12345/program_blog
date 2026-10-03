'use strict';

/**
 * JWT 认证中间件
 * 1. 解析 Authorization: Bearer <token>，将用户信息挂到 ctx.state.user（无效则置 null）
 * 2. 强制鉴权：非白名单的写操作（POST/PUT/DELETE/PATCH）必须携带有效 token
 *    - 游客交互白名单：游客评论、点赞、AI 客服对话（聊天接口自身另行限流）
 */

// 无需登录即可访问的写操作（游客交互）
const guestWritePatterns = [
  /^\/api\/v1\/comments$/, // 游客发表评论
  /^\/api\/v1\/articles\/\d+\/like$/, // 游客点赞文章
  /^\/api\/v1\/comments\/\d+\/like$/, // 游客点赞评论
  /^\/api\/v1\/chat$/, // AI 客服对话（内部限流）
];

// 写操作的白名单（精确匹配）：注册 / 登录
const writeWhitelist = [
  '/api/v1/users/register',
  '/api/v1/users/login',
];

module.exports = () => {
  return async function jwtAuth(ctx, next) {
    const { app } = ctx;

    // 从请求头获取 token
    const token = ctx.request.header.authorization?.replace('Bearer ', '');

    if (token) {
      try {
        // 验证 token
        const decoded = app.jwt.verify(token, app.config.jwt.secret);
        ctx.state.user = decoded;
      } catch (error) {
        // token 无效或过期
        ctx.state.user = null;
      }
    } else {
      ctx.state.user = null;
    }

    // 强制鉴权：写操作必须有有效 token（游客交互与注册登录除外）
    const isWrite = ![ 'GET', 'HEAD', 'OPTIONS' ].includes(ctx.method);
    const isGuestWrite = guestWritePatterns.some(re => re.test(ctx.path));
    const isWhitelistedWrite = writeWhitelist.includes(ctx.path);

    if (isWrite && !isWhitelistedWrite && !isGuestWrite && !ctx.state.user) {
      ctx.status = 401;
      ctx.body = { success: false, message: '请先登录后再执行此操作' };
      return;
    }

    await next();
  };
};
