'use strict';

const { assert, app } = require('egg-mock/bootstrap');

describe('test/app/controller/article.test.js', () => {
  let ctx;

  beforeEach(() => {
    ctx = app.mockContext();
  });

  describe('GET /api/v1/articles', () => {
    it('should get articles list', async () => {
      const response = await app.httpRequest()
        .get('/api/v1/articles')
        .expect(200);

      assert(response.body.success);
      assert(Array.isArray(response.body.data.list));
    });

    it('should support pagination', async () => {
      const response = await app.httpRequest()
        .get('/api/v1/articles?page=1&pageSize=5')
        .expect(200);

      assert(response.body.success);
      assert(response.body.data.page === 1);
      assert(response.body.data.pageSize === 5);
    });

    it('should filter by category', async () => {
      const response = await app.httpRequest()
        .get('/api/v1/articles?categoryId=1')
        .expect(200);

      assert(response.body.success);
    });

    it('should search by keyword', async () => {
      const response = await app.httpRequest()
        .get('/api/v1/articles?keyword=test')
        .expect(200);

      assert(response.body.success);
    });
  });

  describe('GET /api/v1/articles/:id', () => {
    it('should get article by id', async () => {
      // 首先创建一个测试文章
      const article = await ctx.model.Article.create({
        title: 'Test Article',
        slug: 'test-article-' + Date.now(),
        content: '# Test Content',
        htmlContent: '<h1>Test Content</h1>',
        excerpt: 'Test excerpt',
        authorId: 1,
        status: 'published',
      });

      const response = await app.httpRequest()
        .get(`/api/v1/articles/${article.id}`)
        .expect(200);

      assert(response.body.success);
      assert(response.body.data.id === article.id);
      assert(response.body.data.title === 'Test Article');
    });

    it('should return 404 for non-existent article', async () => {
      const response = await app.httpRequest()
        .get('/api/v1/articles/999999')
        .expect(404);

      assert(!response.body.success);
      assert(response.body.message === '文章不存在');
    });
  });

  describe('GET /api/v1/articles/slug/:slug', () => {
    it('should get article by slug', async () => {
      const slug = 'test-slug-' + Date.now();
      await ctx.model.Article.create({
        title: 'Test Slug Article',
        slug,
        content: '# Test Content',
        htmlContent: '<h1>Test Content</h1>',
        excerpt: 'Test excerpt',
        authorId: 1,
        status: 'published',
      });

      const response = await app.httpRequest()
        .get(`/api/v1/articles/slug/${slug}`)
        .expect(200);

      assert(response.body.success);
      assert(response.body.data.slug === slug);
    });

    it('should return 404 for non-existent slug', async () => {
      const response = await app.httpRequest()
        .get('/api/v1/articles/slug/non-existent-slug')
        .expect(404);

      assert(!response.body.success);
    });
  });

  describe('POST /api/v1/articles', () => {
    it('should create article with valid data', async () => {
      const slug = 'create-test-' + Date.now();
      const response = await app.httpRequest()
        .post('/api/v1/articles')
        .send({
          title: 'New Article',
          slug,
          content: '# New Content',
          excerpt: 'New excerpt',
          status: 'draft',
        })
        .expect(200);

      assert(response.body.success);
      assert(response.body.data.title === 'New Article');
      assert(response.body.data.slug === slug);
    });

    it('should return 400 without title', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/articles')
        .send({
          slug: 'test-slug',
          content: '# Content',
        })
        .expect(400);

      assert(!response.body.success);
      assert(response.body.message.includes('标题'));
    });

    it('should return 400 without slug', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/articles')
        .send({
          title: 'Test Title',
          content: '# Content',
        })
        .expect(400);

      assert(!response.body.success);
      assert(response.body.message.includes('别名'));
    });

    it('should return 400 without content', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/articles')
        .send({
          title: 'Test Title',
          slug: 'test-slug',
        })
        .expect(400);

      assert(!response.body.success);
      assert(response.body.message.includes('内容'));
    });

    it('should return 400 for duplicate slug', async () => {
      const slug = 'duplicate-slug-' + Date.now();

      await app.httpRequest()
        .post('/api/v1/articles')
        .send({
          title: 'First Article',
          slug,
          content: '# Content',
        })
        .expect(200);

      const response = await app.httpRequest()
        .post('/api/v1/articles')
        .send({
          title: 'Second Article',
          slug,
          content: '# Content',
        })
        .expect(400);

      assert(!response.body.success);
      assert(response.body.message.includes('别名已存在'));
    });
  });

  describe('PUT /api/v1/articles/:id', () => {
    it('should update article', async () => {
      const article = await ctx.model.Article.create({
        title: 'Original Title',
        slug: 'original-' + Date.now(),
        content: '# Original Content',
        htmlContent: '<h1>Original Content</h1>',
        authorId: 1,
        status: 'draft',
      });

      const response = await app.httpRequest()
        .put(`/api/v1/articles/${article.id}`)
        .send({
          title: 'Updated Title',
        })
        .expect(200);

      assert(response.body.success);
      assert(response.body.data.title === 'Updated Title');
    });

    it('should return 404 for non-existent article', async () => {
      const response = await app.httpRequest()
        .put('/api/v1/articles/999999')
        .send({
          title: 'Updated',
        })
        .expect(404);

      assert(!response.body.success);
    });
  });

  describe('DELETE /api/v1/articles/:id', () => {
    it('should delete article', async () => {
      const article = await ctx.model.Article.create({
        title: 'To Delete',
        slug: 'to-delete-' + Date.now(),
        content: '# Content',
        htmlContent: '<h1>Content</h1>',
        authorId: 1,
        status: 'draft',
      });

      const response = await app.httpRequest()
        .delete(`/api/v1/articles/${article.id}`)
        .expect(200);

      assert(response.body.success);

      // 验证删除
      const deleted = await ctx.model.Article.findByPk(article.id);
      assert(!deleted);
    });

    it('should return 404 for non-existent article', async () => {
      const response = await app.httpRequest()
        .delete('/api/v1/articles/999999')
        .expect(404);

      assert(!response.body.success);
    });
  });

  describe('POST /api/v1/articles/:id/like', () => {
    it('should like article', async () => {
      const article = await ctx.model.Article.create({
        title: 'Like Test',
        slug: 'like-test-' + Date.now(),
        content: '# Content',
        htmlContent: '<h1>Content</h1>',
        authorId: 1,
        status: 'published',
        likeCount: 0,
      });

      const response = await app.httpRequest()
        .post(`/api/v1/articles/${article.id}/like`)
        .expect(200);

      assert(response.body.success);
      assert(response.body.data.likeCount === 1);
    });

    it('should return 404 for non-existent article', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/articles/999999/like')
        .expect(404);

      assert(!response.body.success);
    });
  });

  describe('POST /api/v1/articles/batch-delete', () => {
    it('should batch delete articles', async () => {
      // 创建多个测试文章
      const article1 = await ctx.model.Article.create({
        title: 'Batch Delete Test 1',
        slug: 'batch-delete-1-' + Date.now(),
        content: '# Content 1',
        htmlContent: '<h1>Content 1</h1>',
        authorId: 1,
        status: 'draft',
      });

      const article2 = await ctx.model.Article.create({
        title: 'Batch Delete Test 2',
        slug: 'batch-delete-2-' + Date.now(),
        content: '# Content 2',
        htmlContent: '<h1>Content 2</h1>',
        authorId: 1,
        status: 'draft',
      });

      const article3 = await ctx.model.Article.create({
        title: 'Batch Delete Test 3',
        slug: 'batch-delete-3-' + Date.now(),
        content: '# Content 3',
        htmlContent: '<h1>Content 3</h1>',
        authorId: 1,
        status: 'draft',
      });

      const idsToDelete = [ article1.id, article2.id ];

      const response = await app.httpRequest()
        .post('/api/v1/articles/batch-delete')
        .send({ ids: idsToDelete })
        .expect(200);

      assert(response.body.success);
      assert(response.body.data.count === 2);

      // 验证删除
      const deleted1 = await ctx.model.Article.findByPk(article1.id);
      const deleted2 = await ctx.model.Article.findByPk(article2.id);
      const kept3 = await ctx.model.Article.findByPk(article3.id);

      assert(!deleted1);
      assert(!deleted2);
      assert(kept3); // article3 应该还在
    });

    it('should return 400 without ids', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/articles/batch-delete')
        .send({})
        .expect(400);

      assert(!response.body.success);
    });

    it('should return 400 with empty ids array', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/articles/batch-delete')
        .send({ ids: [] })
        .expect(400);

      assert(!response.body.success);
    });

    it('should return 400 with invalid ids format', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/articles/batch-delete')
        .send({ ids: 'not-an-array' })
        .expect(400);

      assert(!response.body.success);
    });
  });
});
