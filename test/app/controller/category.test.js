'use strict';

const { assert, app } = require('egg-mock/bootstrap');
const { randomBytes } = require('crypto');

function generateUniqueId() {
  return randomBytes(8).toString('hex');
}

describe('test/app/controller/category.test.js', () => {
  let ctx;

  beforeEach(() => {
    ctx = app.mockContext();
  });

  describe('GET /api/v1/categories', () => {
    it('should get all top-level categories', async () => {
      await ctx.model.Category.create({
        name: 'Test Category ' + generateUniqueId(),
        slug: 'test-category-' + Date.now(),
        parentId: null,
        sort: 1,
      });

      const response = await app.httpRequest()
        .get('/api/v1/categories')
        .expect(200);

      assert(response.body.success);
      assert(Array.isArray(response.body.data));
    });
  });

  describe('GET /api/v1/categories/:id', () => {
    it('should get category by id', async () => {
      const category = await ctx.model.Category.create({
        name: 'Category Detail ' + generateUniqueId(),
        slug: 'category-detail-' + Date.now(),
        description: 'Test description',
      });

      const response = await app.httpRequest()
        .get(`/api/v1/categories/${category.id}`)
        .expect(200);

      assert(response.body.success);
      assert(response.body.data.id === category.id);
      assert(response.body.data.name === 'Category Detail');
    });

    it('should return 404 for non-existent category', async () => {
      const response = await app.httpRequest()
        .get('/api/v1/categories/999999')
        .expect(404);

      assert(!response.body.success);
      assert(response.body.message === '分类不存在');
    });
  });

  describe('GET /api/v1/categories/slug/:slug', () => {
    it('should get category by slug', async () => {
      const slug = 'slug-test-' + Date.now();
      await ctx.model.Category.create({
        name: 'Slug Category',
        slug,
        description: 'Test',
      });

      const response = await app.httpRequest()
        .get(`/api/v1/categories/slug/${slug}`)
        .expect(200);

      assert(response.body.success);
      assert(response.body.data.slug === slug);
    });

    it('should return 404 for non-existent slug', async () => {
      const response = await app.httpRequest()
        .get('/api/v1/categories/slug/non-existent')
        .expect(404);

      assert(!response.body.success);
    });
  });

  describe('POST /api/v1/categories', () => {
    it('should create category with valid data', async () => {
      const slug = 'new-category-' + Date.now();
      const response = await app.httpRequest()
        .post('/api/v1/categories')
        .send({
          name: 'New Category ' + generateUniqueId(),
          slug,
          description: 'Category description',
          icon: 'folder',
          sort: 10,
        })
        .expect(200);

      assert(response.body.success);
      assert(response.body.data.name === 'New Category');
      assert(response.body.data.slug === slug);
    });

    it('should return 400 without name', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/categories')
        .send({
          slug: 'test-slug',
        })
        .expect(400);

      assert(!response.body.success);
      assert(response.body.message.includes('分类名称'));
    });

    it('should return 400 without slug', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/categories')
        .send({
          name: 'Test Name',
        })
        .expect(400);

      assert(!response.body.success);
      assert(response.body.message.includes('别名'));
    });

    it('should return 400 for duplicate slug', async () => {
      const slug = 'duplicate-category-' + Date.now();

      await app.httpRequest()
        .post('/api/v1/categories')
        .send({
          name: 'First Category ' + generateUniqueId(),
          slug,
        })
        .expect(200);

      const response = await app.httpRequest()
        .post('/api/v1/categories')
        .send({
          name: 'Second Category ' + generateUniqueId(),
          slug,
        })
        .expect(400);

      assert(!response.body.success);
      assert(response.body.message.includes('别名已存在'));
    });

    it('should create sub-category with parentId', async () => {
      const parent = await ctx.model.Category.create({
        name: 'Parent Category ' + generateUniqueId(),
        slug: 'parent-' + Date.now(),
      });

      const response = await app.httpRequest()
        .post('/api/v1/categories')
        .send({
          name: 'Child Category ' + generateUniqueId(),
          slug: 'child-' + Date.now(),
          parentId: parent.id,
        })
        .expect(200);

      assert(response.body.success);
      assert(response.body.data.parentId === parent.id);
    });
  });

  describe('PUT /api/v1/categories/:id', () => {
    it('should update category', async () => {
      const category = await ctx.model.Category.create({
        name: 'Original Name ' + generateUniqueId(),
        slug: 'original-' + Date.now(),
      });

      const response = await app.httpRequest()
        .put(`/api/v1/categories/${category.id}`)
        .send({
          name: 'Updated Name ' + generateUniqueId(),
          description: 'Updated description',
        })
        .expect(200);

      assert(response.body.success);
      assert(response.body.data.name === 'Updated Name');
    });

    it('should return 404 for non-existent category', async () => {
      const response = await app.httpRequest()
        .put('/api/v1/categories/999999')
        .send({
          name: 'Updated',
        })
        .expect(404);

      assert(!response.body.success);
    });
  });

  describe('DELETE /api/v1/categories/:id', () => {
    it('should delete category', async () => {
      const category = await ctx.model.Category.create({
        name: 'To Delete ' + generateUniqueId(),
        slug: 'to-delete-' + Date.now(),
      });

      const response = await app.httpRequest()
        .delete(`/api/v1/categories/${category.id}`)
        .expect(200);

      assert(response.body.success);

      const deleted = await ctx.model.Category.findByPk(category.id);
      assert(!deleted);
    });

    it('should return 400 when category has children', async () => {
      const parent = await ctx.model.Category.create({
        name: 'Parent ' + generateUniqueId(),
        slug: 'parent-' + Date.now(),
      });

      await ctx.model.Category.create({
        name: 'Child ' + generateUniqueId(),
        slug: 'child-' + Date.now(),
        parentId: parent.id,
      });

      const response = await app.httpRequest()
        .delete(`/api/v1/categories/${parent.id}`)
        .expect(400);

      assert(!response.body.success);
      assert(response.body.message.includes('子分类'));
    });

    it('should return 400 when category has articles', async () => {
      const category = await ctx.model.Category.create({
        name: 'With Articles ' + generateUniqueId(),
        slug: 'with-articles-' + Date.now(),
      });

      await ctx.model.Article.create({
        title: 'Test Article',
        slug: 'test-' + Date.now(),
        content: '# Content',
        htmlContent: '<h1>Content</h1>',
        categoryId: category.id,
        authorId: 1,
        status: 'published',
      });

      const response = await app.httpRequest()
        .delete(`/api/v1/categories/${category.id}`)
        .expect(400);

      assert(!response.body.success);
      assert(response.body.message.includes('文章'));
    });
  });
});
