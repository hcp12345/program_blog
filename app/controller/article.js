'use strict';

const { Controller } = require('egg');
const { marked } = require('marked');
const hljs = require('highlight.js');

// 配置 marked
marked.setOptions({
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true,
  gfm: true,
});

class ArticleController extends Controller {
  // 获取文章列表
  async index() {
    const { ctx } = this;
    const { page = 1, pageSize = 10, status, categoryId, keyword } = ctx.query;

    const where = {};

    // 如果 status 参数存在且不为 'all'，则添加状态筛选
    if (status && status !== 'all') {
      where.status = status;
    } else if (!status) {
      // 默认只显示已发布的文章（前台）
      where.status = 'published';
    }
    // 如果 status === 'all'，则不添加 status 条件，显示所有状态

    if (categoryId) where.categoryId = categoryId;
    if (keyword) {
      ctx.model.Op = ctx.model.Sequelize.Op;
      where[ctx.model.Op.or] = [
        { title: { [ctx.model.Op.like]: `%${keyword}%` } },
        { content: { [ctx.model.Op.like]: `%${keyword}%` } },
      ];
    }

    const result = await ctx.model.Article.findAndCountAll({
      where,
      include: [
        { model: ctx.model.Category, as: 'category', attributes: [ 'id', 'name', 'slug' ] },
        { model: ctx.model.Tag, as: 'tags', attributes: [ 'id', 'name', 'slug', 'color' ] },
        { model: ctx.model.User, as: 'author', attributes: [ 'id', 'username', 'nickname', 'avatar' ] },
      ],
      order: [[ 'isTop', 'DESC' ], [ 'createdAt', 'DESC' ]],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
      attributes: { exclude: [ 'content' ] }, // 列表不返回完整内容
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

  // 获取文章详情
  async show() {
    const { ctx } = this;
    const { id } = ctx.params;

    const article = await ctx.model.Article.findByPk(id, {
      include: [
        { model: ctx.model.Category, as: 'category' },
        { model: ctx.model.Tag, as: 'tags' },
        { model: ctx.model.User, as: 'author', attributes: [ 'id', 'username', 'nickname', 'avatar' ] },
      ],
    });

    if (!article) {
      ctx.status = 404;
      ctx.body = { success: false, message: '文章不存在' };
      return;
    }

    // 增加浏览次数
    await article.increment('viewCount');

    ctx.body = {
      success: true,
      data: article,
    };
  }

  // 根据 slug 获取文章
  async showBySlug() {
    const { ctx } = this;
    const { slug } = ctx.params;

    const article = await ctx.model.Article.findOne({
      where: { slug },
      include: [
        { model: ctx.model.Category, as: 'category' },
        { model: ctx.model.Tag, as: 'tags' },
        { model: ctx.model.User, as: 'author', attributes: [ 'id', 'username', 'nickname', 'avatar' ] },
      ],
    });

    if (!article) {
      ctx.status = 404;
      ctx.body = { success: false, message: '文章不存在' };
      return;
    }

    // 增加浏览次数
    await article.increment('viewCount');

    ctx.body = {
      success: true,
      data: article,
    };
  }

  // 创建文章
  async create() {
    const { ctx } = this;
    const { title, slug, content, excerpt, coverImage, categoryId, tagIds, status = 'draft' } = ctx.request.body;

    // 验证必填字段
    if (!title || !slug || !content) {
      ctx.status = 400;
      ctx.body = { success: false, message: '标题、别名和内容不能为空' };
      return;
    }

    // 检查 slug 是否存在
    const exists = await ctx.model.Article.findOne({ where: { slug } });
    if (exists) {
      ctx.status = 400;
      ctx.body = { success: false, message: '文章别名已存在' };
      return;
    }

    // 渲染 Markdown 为 HTML
    const htmlContent = marked(content);

    const article = await ctx.model.Article.create({
      title,
      slug,
      content,
      htmlContent,
      excerpt: excerpt || content.substring(0, 200),
      coverImage,
      categoryId,
      authorId: 1, // TODO: 从 session 获取当前用户
      status,
    });

    // 关联标签
    if (tagIds && tagIds.length > 0) {
      await article.setTags(tagIds);
    }

    ctx.body = {
      success: true,
      data: article,
    };
  }

  // 更新文章
  async update() {
    const { ctx } = this;
    const { id } = ctx.params;
    const { title, slug, content, excerpt, coverImage, categoryId, tagIds, status } = ctx.request.body;

    const article = await ctx.model.Article.findByPk(id);
    if (!article) {
      ctx.status = 404;
      ctx.body = { success: false, message: '文章不存在' };
      return;
    }

    // 如果修改了 slug，检查是否重复
    if (slug && slug !== article.slug) {
      const exists = await ctx.model.Article.findOne({ where: { slug } });
      if (exists) {
        ctx.status = 400;
        ctx.body = { success: false, message: '文章别名已存在' };
        return;
      }
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (slug) updateData.slug = slug;
    if (content) {
      updateData.content = content;
      updateData.htmlContent = marked(content);
    }
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (status) updateData.status = status;

    await article.update(updateData);

    // 更新标签
    if (tagIds) {
      await article.setTags(tagIds);
    }

    ctx.body = {
      success: true,
      data: article,
    };
  }

  // 删除文章
  async destroy() {
    const { ctx } = this;
    const { id } = ctx.params;

    const article = await ctx.model.Article.findByPk(id);
    if (!article) {
      ctx.status = 404;
      ctx.body = { success: false, message: '文章不存在' };
      return;
    }

    await article.destroy();

    ctx.body = {
      success: true,
      message: '删除成功',
    };
  }

  // 点赞文章
  async like() {
    const { ctx } = this;
    const { id } = ctx.params;

    const article = await ctx.model.Article.findByPk(id);
    if (!article) {
      ctx.status = 404;
      ctx.body = { success: false, message: '文章不存在' };
      return;
    }

    await article.increment('likeCount');

    ctx.body = {
      success: true,
      data: { likeCount: article.likeCount + 1 },
    };
  }

  // 批量删除文章
  async batchDestroy() {
    const { ctx } = this;
    const { ids } = ctx.request.body;

    ctx.logger.info('批量删除文章，IDs:', ids);

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      ctx.status = 400;
      ctx.body = { success: false, message: '请提供要删除的文章 ID 列表' };
      return;
    }

    try {
      const count = await ctx.model.Article.destroy({
        where: {
          id: ids,
        },
      });

      ctx.logger.info('批量删除成功，删除数量:', count);

      ctx.body = {
        success: true,
        message: `成功删除 ${count} 篇文章`,
        data: { count },
      };
    } catch (error) {
      ctx.logger.error('批量删除失败:', error);
      ctx.status = 500;
      ctx.body = { success: false, message: '批量删除失败', error: error.message };
    }
  }
}

module.exports = ArticleController;
