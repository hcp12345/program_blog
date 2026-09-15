'use strict';

module.exports = () => {
  return async function jwtAuth(ctx, next) {
    const { app } = ctx;

    // 检查是否在白名单中
    const whiteList = app.config.jwtAuth?.whiteList || [];
    const isWhiteListed = whiteList.some(path => ctx.path.startsWith(path) || ctx.path === path);

    if (isWhiteListed) {
      await next();
      return;
    }

    // 从请求头获取 token
    const token = ctx.request.header.authorization?.replace('Bearer ', '');

    if (!token) {
      ctx.state.user = null;
      await next();
      return;
    }

    try {
      // 验证 token
      const decoded = app.jwt.verify(token, app.config.jwt.secret);
      ctx.state.user = decoded;
      await next();
    } catch (error) {
      // token 无效或过期
      ctx.state.user = null;
      await next();
    }
  };
};
