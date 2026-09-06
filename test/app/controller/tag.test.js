'use strict';

const { assert, app } = require('egg-mock/bootstrap');

describe('test/app/controller/tag.test.js', () => {
  let ctx;

  beforeEach(() => {
    ctx = app.mockContext();
  });

  describe('GET /api/v1/tags', () => {
    it('should get all tags', async () => {
      await ctx.model.Tag.create({
        name: 'Test Tag',
        slug: 'test-tag-' + Date.now(),
        color: '#3B82F6',
      });

      const response = await app.httpRequest()
        .get('/api/v1/tags')
        .expect(200);

      assert(response.body.success);
      assert(Array.isArray(response.body.data));
    });
  });

  describe('GET /api/v1/tags/:id', () => {
    it('should get tag by id', async () => {
      const tag = await ctx.model.Tag.create({
        name: 'Tag Detail',
        slug: 'tag-detail-' + Date.now(),
        description: 'Test description',
        color: '#EF4444',
      });

      const response = await app.httpRequest()
        .get(`/api/v1/tags/${tag.id}`)
        .expect(200);

      assert(response.body.success);
      assert(response.body.data.id === tag.id);
      assert(response.body.data.name === 'Tag Detail');
    });

    it('should return 404 for non-existent tag', async () => {
      const response = await app.httpRequest()
        .get('/api/v1/tags/999999')
        .expect(404);

      assert(!response.body.success);
      assert(response.body.message === '标签不存在');
    });
  });

  describe('GET /api/v1/tags/slug/:slug', () => {
    it('should get tag by slug', async () => {
      const slug = 'slug-tag-' + Date.now();
      await ctx.model.Tag.create({
        name: 'Slug Tag',
        slug,
        color: '#10B981',
      });

      const response = await app.httpRequest()
        .get(`/api/v1/tags/slug/${slug}`)
        .expect(200);

      assert(response.body.success);
      assert(response.body.data.slug === slug);
    });

    it('should return 404 for non-existent slug', async () => {
      const response = await app.httpRequest()
        .get('/api/v1/tags/slug/non-existent')
        .expect(404);

      assert(!response.body.success);
    });
  });

  describe('POST /api/v1/tags', () => {
    it('should create tag with valid data', async () => {
      const slug = 'new-tag-' + Date.now();
      const response = await app.httpRequest()
        .post('/api/v1/tags')
        .send({
          name: 'New Tag',
          slug,
          description: 'Tag description',
          color: '#F59E0B',
        })
        .expect(200);

      assert(response.body.success);
      assert(response.body.data.name === 'New Tag');
      assert(response.body.data.slug === slug);
      assert(response.body.data.color === '#F59E0B');
    });

    it('should return 400 without name', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/tags')
        .send({
          slug: 'test-slug',
        })
        .expect(400);

      assert(!response.body.success);
      assert(response.body.message.includes('标签名称'));
    });

    it('should return 400 without slug', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/tags')
        .send({
          name: 'Test Name',
        })
        .expect(400);

      assert(!response.body.success);
      assert(response.body.message.includes('别名'));
    });

    it('should return 400 for duplicate slug', async () => {
      const slug = 'duplicate-tag-' + Date.now();

      await app.httpRequest()
        .post('/api/v1/tags')
        .send({
          name: 'First Tag',
          slug,
        })
        .expect(200);

      const response = await app.httpRequest()
        .post('/api/v1/tags')
        .send({
          name: 'Second Tag',
          slug,
        })
        .expect(400);

      assert(!response.body.success);
      assert(response.body.message.includes('别名已存在'));
    });

    it('should create tag without optional fields', async () => {
      const slug = 'minimal-tag-' + Date.now();
      const response = await app.httpRequest()
        .post('/api/v1/tags')
        .send({
          name: 'Minimal Tag',
          slug,
        })
        .expect(200);

      assert(response.body.success);
      assert(response.body.data.name === 'Minimal Tag');
    });
  });

  describe('PUT /api/v1/tags/:id', () => {
    it('should update tag', async () => {
      const tag = await ctx.model.Tag.create({
        name: 'Original Name',
        slug: 'original-' + Date.now(),
        color: '#6366F1',
      });

      const response = await app.httpRequest()
        .put(`/api/v1/tags/${tag.id}`)
        .send({
          name: 'Updated Name',
          description: 'Updated description',
          color: '#8B5CF6',
        })
        .expect(200);

      assert(response.body.success);
      assert(response.body.data.name === 'Updated Name');
      assert(response.body.data.color === '#8B5CF6');
    });

    it('should return 404 for non-existent tag', async () => {
      const response = await app.httpRequest()
        .put('/api/v1/tags/999999')
        .send({
          name: 'Updated',
        })
        .expect(404);

      assert(!response.body.success);
    });
  });

  describe('DELETE /api/v1/tags/:id', () => {
    it('should delete tag', async () => {
      const tag = await ctx.model.Tag.create({
        name: 'To Delete',
        slug: 'to-delete-' + Date.now(),
      });

      const response = await app.httpRequest()
        .delete(`/api/v1/tags/${tag.id}`)
        .expect(200);

      assert(response.body.success);

      const deleted = await ctx.model.Tag.findByPk(tag.id);
      assert(!deleted);
    });

    it('should return 404 for non-existent tag', async () => {
      const response = await app.httpRequest()
        .delete('/api/v1/tags/999999')
        .expect(404);

      assert(!response.body.success);
    });
  });
});
