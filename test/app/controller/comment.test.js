'use strict';

const { assert, app } = require('egg-mock/bootstrap');

describe('test/app/controller/comment.test.js', () => {
  let ctx;
  let testArticle;

  beforeEach(async () => {
    ctx = app.mockContext();
    // 创建测试文章
    testArticle = await ctx.model.Article.create({
      title: 'Test Article for Comments',
      slug: 'comment-test-' + Date.now(),
      content: '# Content',
      htmlContent: '<h1>Content</h1>',
      authorId: 1,
      status: 'published',
    });
  });

  describe('GET /api/v1/comments', () => {
    it('should get comments list', async () => {
      const response = await app.httpRequest()
        .get('/api/v1/comments')
        .expect(200);

      assert(response.body.success);
      assert(Array.isArray(response.body.data.list));
    });

    it('should filter by articleId', async () => {
      const response = await app.httpRequest()
        .get(`/api/v1/comments?articleId=${testArticle.id}`)
        .expect(200);

      assert(response.body.success);
    });

    it('should filter by status', async () => {
      const response = await app.httpRequest()
        .get('/api/v1/comments?status=pending')
        .expect(200);

      assert(response.body.success);
    });

    it('should support pagination', async () => {
      const response = await app.httpRequest()
        .get('/api/v1/comments?page=1&pageSize=5')
        .expect(200);

      assert(response.body.success);
      assert(response.body.data.page === 1);
      assert(response.body.data.pageSize === 5);
    });
  });

  describe('GET /api/v1/comments/:id', () => {
    it('should get comment by id', async () => {
      const comment = await ctx.model.Comment.create({
        content: 'Test comment',
        authorName: 'Test Author',
        authorEmail: 'test@example.com',
        articleId: testArticle.id,
        status: 'approved',
      });

      const response = await app.httpRequest()
        .get(`/api/v1/comments/${comment.id}`)
        .expect(200);

      assert(response.body.success);
      assert(response.body.data.id === comment.id);
      assert(response.body.data.content === 'Test comment');
    });

    it('should return 404 for non-existent comment', async () => {
      const response = await app.httpRequest()
        .get('/api/v1/comments/999999')
        .expect(404);

      assert(!response.body.success);
      assert(response.body.message === '评论不存在');
    });
  });

  describe('POST /api/v1/comments', () => {
    it('should create comment with valid data', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/comments')
        .send({
          content: 'Great article!',
          authorName: 'John Doe',
          authorEmail: 'john@example.com',
          authorUrl: 'https://example.com',
          articleId: testArticle.id,
        })
        .expect(200);

      assert(response.body.success);
      assert(response.body.data.content === 'Great article!');
      assert(response.body.data.status === 'pending');
    });

    it('should return 400 without content', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/comments')
        .send({
          authorName: 'John Doe',
          authorEmail: 'john@example.com',
          articleId: testArticle.id,
        })
        .expect(400);

      assert(!response.body.success);
      assert(response.body.message.includes('内容'));
    });

    it('should return 400 without authorName', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/comments')
        .send({
          content: 'Great article!',
          authorEmail: 'john@example.com',
          articleId: testArticle.id,
        })
        .expect(400);

      assert(!response.body.success);
      assert(response.body.message.includes('昵称'));
    });

    it('should return 400 without authorEmail', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/comments')
        .send({
          content: 'Great article!',
          authorName: 'John Doe',
          articleId: testArticle.id,
        })
        .expect(400);

      assert(!response.body.success);
      assert(response.body.message.includes('邮箱'));
    });

    it('should return 400 without articleId', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/comments')
        .send({
          content: 'Great article!',
          authorName: 'John Doe',
          authorEmail: 'john@example.com',
        })
        .expect(400);

      assert(!response.body.success);
      assert(response.body.message.includes('文章ID'));
    });

    it('should return 400 for invalid email format', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/comments')
        .send({
          content: 'Great article!',
          authorName: 'John Doe',
          authorEmail: 'invalid-email',
          articleId: testArticle.id,
        })
        .expect(400);

      assert(!response.body.success);
      assert(response.body.message.includes('邮箱格式'));
    });

    it('should return 404 for non-existent article', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/comments')
        .send({
          content: 'Great article!',
          authorName: 'John Doe',
          authorEmail: 'john@example.com',
          articleId: 999999,
        })
        .expect(404);

      assert(!response.body.success);
      assert(response.body.message === '文章不存在');
    });

    it('should create reply comment with parentId', async () => {
      const parentComment = await ctx.model.Comment.create({
        content: 'Parent comment',
        authorName: 'Parent Author',
        authorEmail: 'parent@example.com',
        articleId: testArticle.id,
        status: 'approved',
      });

      const response = await app.httpRequest()
        .post('/api/v1/comments')
        .send({
          content: 'Reply to parent',
          authorName: 'Reply Author',
          authorEmail: 'reply@example.com',
          articleId: testArticle.id,
          parentId: parentComment.id,
        })
        .expect(200);

      assert(response.body.success);
      assert(response.body.data.parentId === parentComment.id);
    });
  });

  describe('PUT /api/v1/comments/:id', () => {
    it('should update comment status', async () => {
      const comment = await ctx.model.Comment.create({
        content: 'Test comment',
        authorName: 'Test Author',
        authorEmail: 'test@example.com',
        articleId: testArticle.id,
        status: 'pending',
      });

      const response = await app.httpRequest()
        .put(`/api/v1/comments/${comment.id}`)
        .send({
          status: 'approved',
        })
        .expect(200);

      assert(response.body.success);
      assert(response.body.data.status === 'approved');
    });

    it('should return 400 for invalid status', async () => {
      const comment = await ctx.model.Comment.create({
        content: 'Test comment',
        authorName: 'Test Author',
        authorEmail: 'test@example.com',
        articleId: testArticle.id,
        status: 'pending',
      });

      const response = await app.httpRequest()
        .put(`/api/v1/comments/${comment.id}`)
        .send({
          status: 'invalid_status',
        })
        .expect(400);

      assert(!response.body.success);
      assert(response.body.message === '无效的状态');
    });

    it('should return 404 for non-existent comment', async () => {
      const response = await app.httpRequest()
        .put('/api/v1/comments/999999')
        .send({
          status: 'approved',
        })
        .expect(404);

      assert(!response.body.success);
    });
  });

  describe('DELETE /api/v1/comments/:id', () => {
    it('should delete comment', async () => {
      const comment = await ctx.model.Comment.create({
        content: 'To delete',
        authorName: 'Test Author',
        authorEmail: 'test@example.com',
        articleId: testArticle.id,
        status: 'approved',
      });

      const response = await app.httpRequest()
        .delete(`/api/v1/comments/${comment.id}`)
        .expect(200);

      assert(response.body.success);

      const deleted = await ctx.model.Comment.findByPk(comment.id);
      assert(!deleted);
    });

    it('should return 404 for non-existent comment', async () => {
      const response = await app.httpRequest()
        .delete('/api/v1/comments/999999')
        .expect(404);

      assert(!response.body.success);
    });
  });

  describe('POST /api/v1/comments/:id/like', () => {
    it('should like comment', async () => {
      const comment = await ctx.model.Comment.create({
        content: 'Like me',
        authorName: 'Test Author',
        authorEmail: 'test@example.com',
        articleId: testArticle.id,
        status: 'approved',
        likeCount: 0,
      });

      const response = await app.httpRequest()
        .post(`/api/v1/comments/${comment.id}/like`)
        .expect(200);

      assert(response.body.success);
      assert(response.body.data.likeCount === 1);
    });

    it('should return 404 for non-existent comment', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/comments/999999/like')
        .expect(404);

      assert(!response.body.success);
    });
  });
});
