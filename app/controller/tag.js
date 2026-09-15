'use strict';

const { Controller } = require('egg');

class TagController extends Controller {
  // 获取所有标签
  async index() {
    const { ctx } = this;

    const tags = await ctx.model.Tag.findAll({
      order: [[ 'articleCount', 'DESC' ], [ 'createdAt', 'DESC' ]],
    });

    ctx.body = {
      success: true,
      data: tags,
    };
  }

  // 获取标签详情
  async show() {
    const { ctx } = this;
    const { id } = ctx.params;

    const tag = await ctx.model.Tag.findByPk(id);

    if (!tag) {
      ctx.status = 404;
      ctx.body = { success: false, message: '标签不存在' };
      return;
    }

    // 获取标签下的文章（最多10篇）
    const articles = await ctx.model.Article.findAll({
      where: { status: 'published' },
      include: [
        {
          model: ctx.model.Tag,
          as: 'tags',
          where: { id },
          through: { attributes: [] },
        },
      ],
      attributes: [ 'id', 'title', 'slug', 'excerpt', 'createdAt' ],
      limit: 10,
      order: [[ 'createdAt', 'DESC' ]],
    });

    // 将文章数据添加到标签对象中
    const tagData = tag.toJSON();
    tagData.articles = articles;

    ctx.body = {
      success: true,
      data: tagData,
    };
  }

  // 根据 slug 获取标签
  async showBySlug() {
    const { ctx } = this;
    const { slug } = ctx.params;

    const tag = await ctx.model.Tag.findOne({
      where: { slug },
    });

    if (!tag) {
      ctx.status = 404;
      ctx.body = { success: false, message: '标签不存在' };
      return;
    }

    // 获取标签下的文章（最多10篇）
    const articles = await ctx.model.Article.findAll({
      where: { status: 'published' },
      include: [
        {
          model: ctx.model.Tag,
          as: 'tags',
          where: { id: tag.id },
          through: { attributes: [] },
        },
      ],
      attributes: [ 'id', 'title', 'slug', 'excerpt', 'createdAt' ],
      limit: 10,
      order: [[ 'createdAt', 'DESC' ]],
    });

    // 将文章数据添加到标签对象中
    const tagData = tag.toJSON();
    tagData.articles = articles;

    ctx.body = {
      success: true,
      data: tagData,
    };
  }

  // 创建标签
  async create() {
    const { ctx } = this;
    const { name, slug, description, color } = ctx.request.body;

    if (!name || !slug) {
      ctx.status = 400;
      ctx.body = { success: false, message: '标签名称和别名不能为空' };
      return;
    }

    // 检查 slug 是否存在
    const exists = await ctx.model.Tag.findOne({ where: { slug } });
    if (exists) {
      ctx.status = 400;
      ctx.body = { success: false, message: '标签别名已存在' };
      return;
    }

    const tag = await ctx.model.Tag.create({
      name,
      slug,
      description,
      color,
    });

    ctx.body = {
      success: true,
      data: tag,
    };
  }

  // 更新标签
  async update() {
    const { ctx } = this;
    const { id } = ctx.params;
    const { name, slug, description, color } = ctx.request.body;

    const tag = await ctx.model.Tag.findByPk(id);
    if (!tag) {
      ctx.status = 404;
      ctx.body = { success: false, message: '标签不存在' };
      return;
    }

    // 如果修改了 slug，检查是否重复
    if (slug && slug !== tag.slug) {
      const exists = await ctx.model.Tag.findOne({ where: { slug } });
      if (exists) {
        ctx.status = 400;
        ctx.body = { success: false, message: '标签别名已存在' };
        return;
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;

    await tag.update(updateData);

    ctx.body = {
      success: true,
      data: tag,
    };
  }

  // 删除标签
  async destroy() {
    const { ctx } = this;
    const { id } = ctx.params;

    const tag = await ctx.model.Tag.findByPk(id);
    if (!tag) {
      ctx.status = 404;
      ctx.body = { success: false, message: '标签不存在' };
      return;
    }

    // 删除标签时，关联关系会自动删除（CASCADE）
    await tag.destroy();

    ctx.body = {
      success: true,
      message: '删除成功',
    };
  }
}

module.exports = TagController;
