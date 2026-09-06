'use strict';

const { Controller } = require('egg');

class CategoryController extends Controller {
  // 获取所有分类
  async index() {
    const { ctx } = this;

    const categories = await ctx.model.Category.findAll({
      include: [
        {
          model: ctx.model.Category,
          as: 'children',
          include: [{ model: ctx.model.Category, as: 'children' }],
        },
      ],
      where: { parentId: null }, // 只获取顶级分类
      order: [[ 'sort', 'ASC' ], [ 'createdAt', 'DESC' ]],
    });

    ctx.body = {
      success: true,
      data: categories,
    };
  }

  // 获取分类详情
  async show() {
    const { ctx } = this;
    const { id } = ctx.params;

    const category = await ctx.model.Category.findByPk(id, {
      include: [
        { model: ctx.model.Category, as: 'parent' },
        { model: ctx.model.Category, as: 'children' },
      ],
    });

    if (!category) {
      ctx.status = 404;
      ctx.body = { success: false, message: '分类不存在' };
      return;
    }

    ctx.body = {
      success: true,
      data: category,
    };
  }

  // 根据 slug 获取分类
  async showBySlug() {
    const { ctx } = this;
    const { slug } = ctx.params;

    const category = await ctx.model.Category.findOne({
      where: { slug },
      include: [
        { model: ctx.model.Category, as: 'parent' },
        { model: ctx.model.Category, as: 'children' },
      ],
    });

    if (!category) {
      ctx.status = 404;
      ctx.body = { success: false, message: '分类不存在' };
      return;
    }

    ctx.body = {
      success: true,
      data: category,
    };
  }

  // 创建分类
  async create() {
    const { ctx } = this;
    const { name, slug, description, icon, parentId, sort } = ctx.request.body;

    if (!name || !slug) {
      ctx.status = 400;
      ctx.body = { success: false, message: '分类名称和别名不能为空' };
      return;
    }

    // 检查 slug 是否存在
    const exists = await ctx.model.Category.findOne({ where: { slug } });
    if (exists) {
      ctx.status = 400;
      ctx.body = { success: false, message: '分类别名已存在' };
      return;
    }

    const category = await ctx.model.Category.create({
      name,
      slug,
      description,
      icon,
      parentId,
      sort: sort || 0,
    });

    ctx.body = {
      success: true,
      data: category,
    };
  }

  // 更新分类
  async update() {
    const { ctx } = this;
    const { id } = ctx.params;
    const { name, slug, description, icon, parentId, sort } = ctx.request.body;

    const category = await ctx.model.Category.findByPk(id);
    if (!category) {
      ctx.status = 404;
      ctx.body = { success: false, message: '分类不存在' };
      return;
    }

    // 如果修改了 slug，检查是否重复
    if (slug && slug !== category.slug) {
      const exists = await ctx.model.Category.findOne({ where: { slug } });
      if (exists) {
        ctx.status = 400;
        ctx.body = { success: false, message: '分类别名已存在' };
        return;
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (parentId !== undefined) updateData.parentId = parentId;
    if (sort !== undefined) updateData.sort = sort;

    await category.update(updateData);

    ctx.body = {
      success: true,
      data: category,
    };
  }

  // 删除分类
  async destroy() {
    const { ctx } = this;
    const { id } = ctx.params;

    const category = await ctx.model.Category.findByPk(id);
    if (!category) {
      ctx.status = 404;
      ctx.body = { success: false, message: '分类不存在' };
      return;
    }

    // 检查是否有子分类
    const childrenCount = await ctx.model.Category.count({ where: { parentId: id } });
    if (childrenCount > 0) {
      ctx.status = 400;
      ctx.body = { success: false, message: '该分类下有子分类，无法删除' };
      return;
    }

    // 检查是否有关联的文章
    const articleCount = await ctx.model.Article.count({ where: { categoryId: id } });
    if (articleCount > 0) {
      ctx.status = 400;
      ctx.body = { success: false, message: '该分类下有文章，无法删除' };
      return;
    }

    await category.destroy();

    ctx.body = {
      success: true,
      message: '删除成功',
    };
  }
}

module.exports = CategoryController;
