'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;

  // 文章路由
  router.get('/api/v1/articles', controller.article.index);
  router.get('/api/v1/articles/search', controller.article.index);
  router.get('/api/v1/articles/hot', controller.search.hot);
  router.get('/api/v1/articles/slug/:slug', controller.article.showBySlug);
  router.post('/api/v1/articles', controller.article.create);
  router.post('/api/v1/articles/batch-delete', controller.article.batchDestroy); // 必须在 /:id 之前
  router.get('/api/v1/articles/:id', controller.article.show);
  router.put('/api/v1/articles/:id', controller.article.update);
  router.delete('/api/v1/articles/:id', controller.article.destroy);
  router.post('/api/v1/articles/:id/like', controller.article.like);

  // 分类路由
  router.get('/api/v1/categories', controller.category.index);
  router.get('/api/v1/categories/:id', controller.category.show);
  router.get('/api/v1/categories/slug/:slug', controller.category.showBySlug);
  router.post('/api/v1/categories', controller.category.create);
  router.put('/api/v1/categories/:id', controller.category.update);
  router.delete('/api/v1/categories/:id', controller.category.destroy);

  // 标签路由
  router.get('/api/v1/tags', controller.tag.index);
  router.get('/api/v1/tags/:id', controller.tag.show);
  router.get('/api/v1/tags/slug/:slug', controller.tag.showBySlug);
  router.post('/api/v1/tags', controller.tag.create);
  router.put('/api/v1/tags/:id', controller.tag.update);
  router.delete('/api/v1/tags/:id', controller.tag.destroy);

  // 评论路由
  router.get('/api/v1/comments', controller.comment.index);
  router.get('/api/v1/comments/:id', controller.comment.show);
  router.post('/api/v1/comments', controller.comment.create);
  router.put('/api/v1/comments/:id', controller.comment.update);
  router.delete('/api/v1/comments/:id', controller.comment.destroy);
  router.post('/api/v1/comments/:id/like', controller.comment.like);

  // 搜索路由
  router.get('/api/v1/search', controller.search.search);

  // 用户认证路由
  router.post('/api/v1/users/register', controller.user.register);
  router.post('/api/v1/users/login', controller.user.login);
  router.get('/api/v1/users/me', controller.user.getCurrentUser);
  router.put('/api/v1/users/profile', controller.user.updateProfile);
  router.put('/api/v1/users/password', controller.user.changePassword);

  // 健康检查
  router.get('/health', ctx => {
    ctx.body = { status: 'ok', timestamp: new Date().toISOString() };
  });

  // 默认路由
  router.get('/', controller.home.index);
};
