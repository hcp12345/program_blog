'use strict';

const { Controller } = require('egg');

class CommentController extends Controller {
  // 获取评论列表
  async index() {
    const { ctx } = this;
    const { page = 1, pageSize = 10, articleId, status } = ctx.query;

    const where = {};
    if (articleId) where.articleId = articleId;
    if (status) where.status = status;

    const result = await ctx.model.Comment.findAndCountAll({
      where,
      include: [
        { model: ctx.model.Article, as: 'article', attributes: [ 'id', 'title', 'slug' ] },
      ],
      order: [[ 'createdAt', 'DESC' ]],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
    });

    ctx.body = {
      success: true,
      data: {
        list: result.rows,
        total: result.count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
      },
    };
  }

  // 获取评论详情
  async show() {
    const { ctx } = this;
    const { id } = ctx.params;

    const comment = await ctx.model.Comment.findByPk(id, {
      include: [
        { model: ctx.model.Article, as: 'article' },
        { model: ctx.model.Comment, as: 'parent' },
        { model: ctx.model.Comment, as: 'replies' },
      ],
    });

    if (!comment) {
      ctx.status = 404;
      ctx.body = { success: false, message: '评论不存在' };
      return;
    }

    ctx.body = {
      success: true,
      data: comment,
    };
  }

  // 创建评论
  async create() {
    const { ctx } = this;
    const { content, authorName, authorEmail, authorUrl, parentId, articleId } = ctx.request.body;

    // 验证必填字段
    if (!content || !authorName || !authorEmail || !articleId) {
      ctx.status = 400;
      ctx.body = { success: false, message: '内容、昵称、邮箱和文章ID不能为空' };
      return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(authorEmail)) {
      ctx.status = 400;
      ctx.body = { success: false, message: '邮箱格式不正确' };
      return;
    }

    // 检查文章是否存在
    const article = await ctx.model.Article.findByPk(articleId);
    if (!article) {
      ctx.status = 404;
      ctx.body = { success: false, message: '文章不存在' };
      return;
    }

    // 获取客户端IP
    const authorIp = ctx.ip;

    // 生成头像（使用 Gravatar 或其他服务）
    const authorAvatar = `https://www.gravatar.com/avatar/${require('crypto').createHash('md5').update(authorEmail.trim().toLowerCase())
      .digest('hex')}?d=identicon`;

    const comment = await ctx.model.Comment.create({
      content,
      authorName,
      authorEmail,
      authorUrl,
      parentId,
      articleId,
      authorIp,
      authorAvatar,
      status: 'pending', // 默认待审核
    });

    // 增加文章评论计数
    await article.increment('commentCount');

    ctx.body = {
      success: true,
      data: comment,
      message: '评论成功，等待审核',
    };
  }

  // 更新评论状态（审核）
  async update() {
    const { ctx } = this;
    const { id } = ctx.params;
    const { status } = ctx.request.body;

    const comment = await ctx.model.Comment.findByPk(id);
    if (!comment) {
      ctx.status = 404;
      ctx.body = { success: false, message: '评论不存在' };
      return;
    }

    if (![ 'pending', 'approved', 'rejected' ].includes(status)) {
      ctx.status = 400;
      ctx.body = { success: false, message: '无效的状态' };
      return;
    }

    await comment.update({ status });

    ctx.body = {
      success: true,
      data: comment,
    };
  }

  // 删除评论
  async destroy() {
    const { ctx } = this;
    const { id } = ctx.params;

    const comment = await ctx.model.Comment.findByPk(id);
    if (!comment) {
      ctx.status = 404;
      ctx.body = { success: false, message: '评论不存在' };
      return;
    }

    // 减少文章评论计数
    const article = await ctx.model.Article.findByPk(comment.articleId);
    if (article) {
      await article.decrement('commentCount');
    }

    await comment.destroy();

    ctx.body = {
      success: true,
      message: '删除成功',
    };
  }

  // 点赞评论
  async like() {
    const { ctx } = this;
    const { id } = ctx.params;

    const comment = await ctx.model.Comment.findByPk(id);
    if (!comment) {
      ctx.status = 404;
      ctx.body = { success: false, message: '评论不存在' };
      return;
    }

    await comment.increment('likeCount');

    ctx.body = {
      success: true,
      data: { likeCount: comment.likeCount + 1 },
    };
  }
}

module.exports = CommentController;
