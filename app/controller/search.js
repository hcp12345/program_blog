'use strict';

const { Controller } = require('egg');

class SearchController extends Controller {
  // 搜索文章
  async search() {
    const { ctx } = this;
    const { keyword, page = 1, pageSize = 10 } = ctx.query;

    if (!keyword) {
      ctx.status = 400;
      ctx.body = { success: false, message: '搜索关键词不能为空' };
      return;
    }

    ctx.model.Op = ctx.model.Sequelize.Op;

    const where = {
      status: 'published',
      [ctx.model.Op.or]: [
        { title: { [ctx.model.Op.like]: `%${keyword}%` } },
        { content: { [ctx.model.Op.like]: `%${keyword}%` } },
        { excerpt: { [ctx.model.Op.like]: `%${keyword}%` } },
      ],
    };

    const result = await ctx.model.Article.findAndCountAll({
      where,
      include: [
        { model: ctx.model.Category, as: 'category', attributes: [ 'id', 'name', 'slug' ] },
        { model: ctx.model.Tag, as: 'tags', attributes: [ 'id', 'name', 'slug', 'color' ] },
        { model: ctx.model.User, as: 'author', attributes: [ 'id', 'username', 'nickname', 'avatar' ] },
      ],
      order: [[ 'createdAt', 'DESC' ]],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
      attributes: { exclude: [ 'content' ] },
    });

    ctx.body = {
      success: true,
      data: {
        keyword,
        list: result.rows,
        total: result.count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
      },
    };
  }

  // 热门搜索（可以根据搜索频率、浏览量等）
  async hot() {
    const { ctx } = this;

    // 返回浏览量最高的文章作为热门内容
    const articles = await ctx.model.Article.findAll({
      where: { status: 'published' },
      order: [[ 'viewCount', 'DESC' ], [ 'likeCount', 'DESC' ]],
      limit: 10,
      attributes: [ 'id', 'title', 'slug', 'viewCount', 'likeCount' ],
    });

    ctx.body = {
      success: true,
      data: articles,
    };
  }
}

module.exports = SearchController;
