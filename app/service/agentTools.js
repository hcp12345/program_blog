'use strict';

/**
 * Agent 工具注册表
 *
 * 设计原则：Agent 不直接写 SQL，工具执行体复用站内既有查询/写入逻辑，
 * 保证 AI 与后台管理走同一套规则。每个工具定义：
 *   name         工具名（LLM 调用标识）
 *   description  给 LLM 看的能力说明
 *   parameters   JSON Schema 入参定义
 *   requiredRole 'guest' 游客即可用 | 'admin' 仅管理员
 *   execute      async (ctx, args) => 结果对象（会被序列化回填给 LLM）
 */

const { Op } = require('sequelize');
const { marked } = require('marked');

// 组装文章的对外摘要（不含全文），便于 LLM 引用与前端渲染链接卡片
function toArticleBrief(article) {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    status: article.status,
    viewCount: article.viewCount,
    likeCount: article.likeCount,
    category: article.category ? article.category.name : null,
    tags: (article.tags || []).map(t => t.name),
    url: `/articles/${article.slug}`,
    createdAt: article.createdAt,
  };
}

const tools = [
  {
    name: 'searchArticles',
    description: '按关键词搜索已发布的博客文章，返回文章标题、摘要、分类、标签和链接。当用户想找某方面内容时使用。',
    parameters: {
      type: 'object',
      properties: {
        keyword: { type: 'string', description: '搜索关键词，可以是技术名词、主题等' },
        page: { type: 'integer', description: '页码，默认 1' },
        pageSize: { type: 'integer', description: '每页条数，默认 5，最多 10' },
      },
      required: [ 'keyword' ],
    },
    requiredRole: 'guest',
    async execute(ctx, args) {
      const page = parseInt(args.page) || 1;
      const pageSize = Math.min(parseInt(args.pageSize) || 5, 10);
      const keyword = `%${args.keyword}%`;

      const result = await ctx.model.Article.findAndCountAll({
        where: {
          status: 'published',
          [Op.or]: [
            { title: { [Op.like]: keyword } },
            { content: { [Op.like]: keyword } },
            { excerpt: { [Op.like]: keyword } },
          ],
        },
        include: [
          { model: ctx.model.Category, as: 'category', attributes: [ 'id', 'name', 'slug' ] },
          { model: ctx.model.Tag, as: 'tags', attributes: [ 'id', 'name', 'slug' ] },
        ],
        order: [[ 'createdAt', 'DESC' ]],
        limit: pageSize,
        offset: (page - 1) * pageSize,
        attributes: { exclude: [ 'content', 'htmlContent' ] },
      });

      return {
        keyword: args.keyword,
        total: result.count,
        list: result.rows.map(toArticleBrief),
        tip: result.count === 0 ? '没有匹配的文章，可以换关键词或建议用户浏览分类列表' : undefined,
      };
    },
  },

  {
    name: 'getArticle',
    description: '根据文章 slug 或 ID 获取单篇文章的详细内容（含 Markdown 正文前 2000 字），用于回答文章内容相关问题。',
    parameters: {
      type: 'object',
      properties: {
        slugOrId: { type: 'string', description: '文章 slug 或数字 ID' },
      },
      required: [ 'slugOrId' ],
    },
    requiredRole: 'guest',
    async execute(ctx, args) {
      const key = String(args.slugOrId || '').trim();
      const where = /^\d+$/.test(key) ? { id: parseInt(key) } : { slug: key };

      const article = await ctx.model.Article.findOne({
        where,
        include: [
          { model: ctx.model.Category, as: 'category', attributes: [ 'id', 'name', 'slug' ] },
          { model: ctx.model.Tag, as: 'tags', attributes: [ 'id', 'name', 'slug' ] },
        ],
      });

      if (!article) {
        return { found: false, message: `未找到文章：${key}` };
      }

      const brief = toArticleBrief(article);
      return {
        found: true,
        ...brief,
        content: (article.content || '').slice(0, 2000),
        truncated: (article.content || '').length > 2000,
      };
    },
  },

  {
    name: 'listCategories',
    description: '列出博客的全部文章分类（名称、slug、文章数），用于站点导览类问题。',
    parameters: { type: 'object', properties: {} },
    requiredRole: 'guest',
    async execute(ctx) {
      const categories = await ctx.model.Category.findAll({
        order: [[ 'sort', 'ASC' ], [ 'id', 'ASC' ]],
      });

      const list = [];
      for (const c of categories) {
        const count = await ctx.model.Article.count({ where: { categoryId: c.id, status: 'published' } });
        list.push({ id: c.id, name: c.name, slug: c.slug, description: c.description, articleCount: count });
      }
      return { total: list.length, list };
    },
  },

  {
    name: 'listTags',
    description: '列出博客的全部标签（名称、slug、关联文章数），用于站点导览类问题。',
    parameters: { type: 'object', properties: {} },
    requiredRole: 'guest',
    async execute(ctx) {
      const tags = await ctx.model.Tag.findAll({ order: [[ 'id', 'ASC' ]] });
      const list = [];
      for (const t of tags) {
        const count = await ctx.model.Article.count({
          include: [{ model: ctx.model.Tag, as: 'tags', where: { id: t.id }, attributes: [] }],
          where: { status: 'published' },
        });
        list.push({ id: t.id, name: t.name, slug: t.slug, color: t.color, articleCount: count });
      }
      return { total: list.length, list };
    },
  },

  {
    name: 'getHotArticles',
    description: '获取浏览量最高的热门文章列表，用于"最近什么最火/推荐阅读"类问题。',
    parameters: {
      type: 'object',
      properties: {
        limit: { type: 'integer', description: '返回条数，默认 5，最多 10' },
      },
    },
    requiredRole: 'guest',
    async execute(ctx, args) {
      const limit = Math.min(parseInt(args.limit) || 5, 10);
      const rows = await ctx.model.Article.findAll({
        where: { status: 'published' },
        order: [[ 'viewCount', 'DESC' ], [ 'likeCount', 'DESC' ]],
        limit,
        attributes: [ 'id', 'title', 'slug', 'viewCount', 'likeCount', 'excerpt' ],
      });
      return { list: rows.map(r => ({ ...toArticleBrief(r), url: `/articles/${r.slug}` })) };
    },
  },

  // ===== 以下为管理员工具 =====

  {
    name: 'getSiteStats',
    description: '获取站点统计信息：文章总数、已发布数、草稿数、评论总数、待审核评论数、分类数、标签数。仅管理员可用。',
    parameters: { type: 'object', properties: {} },
    requiredRole: 'admin',
    async execute(ctx) {
      const [
        articleTotal, published, draft, commentTotal, commentPending, categoryTotal, tagTotal,
      ] = await Promise.all([
        ctx.model.Article.count(),
        ctx.model.Article.count({ where: { status: 'published' } }),
        ctx.model.Article.count({ where: { status: 'draft' } }),
        ctx.model.Comment.count(),
        ctx.model.Comment.count({ where: { status: 'pending' } }),
        ctx.model.Category.count(),
        ctx.model.Tag.count(),
      ]);

      return {
        articleTotal, articlePublished: published, articleDraft: draft,
        commentTotal, commentPending, categoryTotal, tagTotal,
      };
    },
  },

  {
    name: 'createArticle',
    description: '创建一篇博客文章（Markdown 正文）。publishMode 为 manual 时保存为草稿等待人工确认，为 auto 时直接发布。创建前必须先向管理员复述标题与摘要并取得确认。仅管理员可用。',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: '文章标题' },
        content: { type: 'string', description: 'Markdown 正文' },
        excerpt: { type: 'string', description: '摘要，可选' },
        categoryId: { type: 'integer', description: '分类 ID，可选' },
        tagNames: { type: 'array', items: { type: 'string' }, description: '标签名数组，可选，不存在的标签会自动创建' },
        publishMode: { type: 'string', enum: [ 'auto', 'manual' ], description: '发布模式：auto 直接发布 / manual 存为草稿，默认取站点配置' },
      },
      required: [ 'title', 'content' ],
    },
    requiredRole: 'admin',
    async execute(ctx, args, options = {}) {
      const mode = args.publishMode || options.defaultPublishMode || 'manual';
      const status = mode === 'auto' ? 'published' : 'draft';

      // slug 生成：中文标题回退为拼音无关的时间戳短链，保证唯一
      const base = String(args.title)
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .slice(0, 120) || 'article';
      // 纯 ASCII 标题直接用作 slug，中文标题回退为时间戳短链，保证唯一
      let slug = /^[\w-]*$/.test(base) && base ? base : `ai-${Date.now()}`;
      const exists = await ctx.model.Article.findOne({ where: { slug } });
      if (exists) slug = `${slug}-${Date.now().toString().slice(-5)}`;

      const article = await ctx.model.Article.create({
        title: args.title,
        slug,
        content: args.content,
        htmlContent: marked(args.content),
        excerpt: args.excerpt || String(args.content)
          .replace(/[#*`>\-\n]/g, ' ')
          .trim()
          .slice(0, 200),
        categoryId: args.categoryId || null,
        authorId: ctx.state.user ? ctx.state.user.userId : 1,
        status,
      });

      // 标签：按名称查找或创建，再关联
      if (Array.isArray(args.tagNames) && args.tagNames.length > 0) {
        const tagIds = [];
        for (const name of args.tagNames.slice(0, 10)) {
          const tName = String(name).trim();
          if (!tName) continue;
          const [ tag ] = await ctx.model.Tag.findOrCreate({
            where: { name: tName },
            defaults: { name: tName, slug: `tag-${Date.now()}${Math.floor(Math.random() * 1000)}` },
          });
          tagIds.push(tag.id);
        }
        if (tagIds.length) await article.setTags(tagIds);
      }

      return {
        success: true,
        id: article.id,
        title: article.title,
        slug: article.slug,
        status: article.status,
        url: `/articles/${article.slug}`,
        message: status === 'published' ? '文章已直接发布' : '文章已保存为草稿，请到后台确认后发布',
      };
    },
  },

  {
    name: 'updateArticleStatus',
    description: '修改文章状态（published 发布 / draft 转草稿 / archived 归档）。仅管理员可用。',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'integer', description: '文章 ID' },
        status: { type: 'string', enum: [ 'published', 'draft', 'archived' ], description: '目标状态' },
      },
      required: [ 'id', 'status' ],
    },
    requiredRole: 'admin',
    async execute(ctx, args) {
      const article = await ctx.model.Article.findByPk(args.id);
      if (!article) return { success: false, message: `文章 ${args.id} 不存在` };
      await article.update({ status: args.status });
      return { success: true, id: article.id, title: article.title, status: article.status };
    },
  },

  {
    name: 'listPendingComments',
    description: '列出待审核的评论（含所属文章），用于评论管理。仅管理员可用。',
    parameters: {
      type: 'object',
      properties: {
        limit: { type: 'integer', description: '返回条数，默认 10' },
      },
    },
    requiredRole: 'admin',
    async execute(ctx, args) {
      const limit = Math.min(parseInt(args.limit) || 10, 20);
      const rows = await ctx.model.Comment.findAll({
        where: { status: 'pending' },
        include: [{ model: ctx.model.Article, as: 'article', attributes: [ 'id', 'title', 'slug' ] }],
        order: [[ 'createdAt', 'DESC' ]],
        limit,
      });
      return {
        total: rows.length,
        list: rows.map(c => ({
          id: c.id, content: c.content, authorName: c.authorName,
          article: c.article ? c.article.title : null, createdAt: c.createdAt,
        })),
        tip: '如需通过或拒绝某条评论，请引导管理员在后台评论管理页操作',
      };
    },
  },
];

/**
 * 按角色获取可用工具（OpenAI tools 格式）
 * @param {string} role guest 或 admin
 * @return {Array} 工具定义数组
 */
function getToolsForRole(role) {
  return tools
    .filter(t => t.requiredRole === 'guest' || role === 'admin')
    .map(t => ({
      type: 'function',
      function: { name: t.name, description: t.description, parameters: t.parameters },
    }));
}

/**
 * 执行工具（含白名单与角色二次校验）
 * @param {object} ctx egg 上下文
 * @param {string} name 工具名
 * @param {object} args 工具入参
 * @param {object} options { role, defaultPublishMode }
 * @return {Promise<object>} 工具执行结果
 */
async function executeTool(ctx, name, args, options = {}) {
  const tool = tools.find(t => t.name === name);
  if (!tool) return { error: `未知工具：${name}` };

  const role = options.role || 'guest';
  if (tool.requiredRole === 'admin' && role !== 'admin') {
    return { error: '该操作需要管理员权限，请先以管理员身份登录' };
  }

  try {
    return await tool.execute(ctx, args || {}, options);
  } catch (error) {
    ctx.logger.error('[agent] 工具执行失败 %s: %s', name, error.message);
    return { error: `工具执行失败：${error.message}` };
  }
}

module.exports = { tools, getToolsForRole, executeTool };
