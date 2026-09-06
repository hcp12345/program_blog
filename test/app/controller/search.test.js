'use strict';

const { assert, app } = require('egg-mock/bootstrap');

describe('test/app/controller/search.test.js', () => {
  let ctx;

  beforeEach(() => {
    ctx = app.mockContext();
  });

  describe('GET /api/v1/search', () => {
    beforeEach(async () => {
      // 创建测试文章
      await ctx.model.Article.create({
        title: 'JavaScript Programming Guide',
        slug: 'js-guide-' + Date.now(),
        content: 'Learn JavaScript programming from scratch',
        htmlContent: '<p>Learn JavaScript programming</p>',
        excerpt: 'JavaScript guide',
        authorId: 1,
        status: 'published',
        viewCount: 100,
      });

      await ctx.model.Article.create({
        title: 'Python Tutorial',
        slug: 'python-tutorial-' + Date.now(),
        content: 'Complete Python tutorial for beginners',
        htmlContent: '<p>Python tutorial</p>',
        excerpt: 'Python basics',
        authorId: 1,
        status: 'published',
        viewCount: 50,
      });
    });

    it('should search articles by keyword in title', async () => {
      const response = await app.httpRequest()
        .get('/api/v1/search?keyword=JavaScript')
        .expect(200);

      assert(response.body.success);
      assert(response.body.data.keyword === 'JavaScript');
      assert(Array.isArray(response.body.data.list));
      assert(response.body.data.list.length > 0);
    });

    it('should search articles by keyword in content', async () => {
      const response = await app.httpRequest()
        .get('/api/v1/search?keyword=programming')
        .expect(200);

      assert(response.body.success);
      assert(Array.isArray(response.body.data.list));
    });

    it('should return 400 without keyword', async () => {
      const response = await app.httpRequest()
        .get('/api/v1/search')
        .expect(400);

      assert(!response.body.success);
      assert(response.body.message === '搜索关键词不能为空');
    });

    it('should support pagination', async () => {
      const response = await app.httpRequest()
        .get('/api/v1/search?keyword=test&page=1&pageSize=10')
        .expect(200);

      assert(response.body.success);
      assert(response.body.data.page === 1);
      assert(response.body.data.pageSize === 10);
    });

    it('should only return published articles', async () => {
      // 创建草稿文章
      await ctx.model.Article.create({
        title: 'Draft Article with keyword',
        slug: 'draft-' + Date.now(),
        content: 'This is a draft',
        htmlContent: '<p>Draft</p>',
        authorId: 1,
        status: 'draft',
      });

      const response = await app.httpRequest()
        .get('/api/v1/search?keyword=Draft')
        .expect(200);

      // 草稿文章不应该出现在搜索结果中
      assert(response.body.success);
      response.body.data.list.forEach(article => {
        assert(article.status === 'published');
      });
    });

    it('should exclude content field from results', async () => {
      const response = await app.httpRequest()
        .get('/api/v1/search?keyword=JavaScript')
        .expect(200);

      assert(response.body.success);
      if (response.body.data.list.length > 0) {
        assert(response.body.data.list[0].content === undefined);
      }
    });
  });

  describe('GET /api/v1/articles/hot', () => {
    beforeEach(async () => {
      // 创建测试文章
      await ctx.model.Article.create({
        title: 'Hot Article 1',
        slug: 'hot-1-' + Date.now(),
        content: 'Content 1',
        htmlContent: '<p>Content 1</p>',
        authorId: 1,
        status: 'published',
        viewCount: 1000,
        likeCount: 100,
      });

      await ctx.model.Article.create({
        title: 'Hot Article 2',
        slug: 'hot-2-' + Date.now(),
        content: 'Content 2',
        htmlContent: '<p>Content 2</p>',
        authorId: 1,
        status: 'published',
        viewCount: 500,
        likeCount: 50,
      });

      await ctx.model.Article.create({
        title: 'Draft Article',
        slug: 'draft-' + Date.now(),
        content: 'Content 3',
        htmlContent: '<p>Content 3</p>',
        authorId: 1,
        status: 'draft',
        viewCount: 2000,
        likeCount: 200,
      });
    });

    it('should get hot articles ordered by viewCount and likeCount', async () => {
      const response = await app.httpRequest()
        .get('/api/v1/articles/hot')
        .expect(200);

      assert(response.body.success);
      assert(Array.isArray(response.body.data));
      assert(response.body.data.length <= 10);

      // 验证只返回已发布的文章
      response.body.data.forEach(article => {
        assert(article.status === 'published');
      });

      // 验证排序（浏览量高的在前）
      if (response.body.data.length >= 2) {
        assert(response.body.data[0].viewCount >= response.body.data[1].viewCount);
      }
    });

    it('should return limited fields only', async () => {
      const response = await app.httpRequest()
        .get('/api/v1/articles/hot')
        .expect(200);

      assert(response.body.success);
      if (response.body.data.length > 0) {
        const article = response.body.data[0];
        assert(article.id !== undefined);
        assert(article.title !== undefined);
        assert(article.slug !== undefined);
        assert(article.viewCount !== undefined);
        assert(article.likeCount !== undefined);
        // 不应该包含这些字段
        assert(article.content === undefined);
        assert(article.htmlContent === undefined);
      }
    });
  });
});
