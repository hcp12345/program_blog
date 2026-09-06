'use strict';

const { assert, app } = require('egg-mock/bootstrap');
const { randomBytes } = require('crypto');

// 生成唯一的测试数据
function generateUniqueId() {
  return randomBytes(8).toString('hex');
}

describe('test/app/controller/user.test.js', () => {
  let ctx;

  beforeEach(() => {
    ctx = app.mockContext();
  });

  describe('POST /api/v1/users/register', () => {
    it('should register user with valid data', async () => {
      const username = 'testuser_' + Date.now() + '_' + generateUniqueId();
      const response = await app.httpRequest()
        .post('/api/v1/users/register')
        .send({
          username,
          email: `test_${Date.now() + '_' + generateUniqueId()}@example.com`,
          password: 'password123',
          nickname: 'Test User',
        })
        .expect(201);

      assert(response.body.success);
      assert(response.body.data.username === username);
      assert(!response.body.data.password);
    });

    it('should return 400 without username', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/users/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(400);

      assert(!response.body.success);
      assert(response.body.message.includes('用户名'));
    });

    it('should return 400 without email', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/users/register')
        .send({
          username: 'testuser',
          password: 'password123',
        })
        .expect(400);

      assert(!response.body.success);
      assert(response.body.message.includes('邮箱'));
    });

    it('should return 400 without password', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/users/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
        })
        .expect(400);

      assert(!response.body.success);
      assert(response.body.message.includes('密码'));
    });

    it('should return 400 for invalid email format', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/users/register')
        .send({
          username: 'testuser',
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);

      assert(!response.body.success);
      assert(response.body.message.includes('邮箱格式'));
    });

    it('should return 400 for short username', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/users/register')
        .send({
          username: 'ab',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(400);

      assert(!response.body.success);
      assert(response.body.message.includes('用户名长度'));
    });

    it('should return 400 for long username', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/users/register')
        .send({
          username: 'a'.repeat(25),
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(400);

      assert(!response.body.success);
      assert(response.body.message.includes('用户名长度'));
    });

    it('should return 400 for short password', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/users/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: '12345',
        })
        .expect(400);

      assert(!response.body.success);
      assert(response.body.message.includes('密码长度'));
    });

    it('should return 400 for duplicate username', async () => {
      const username = 'duplicate_user_' + Date.now() + '_' + generateUniqueId();

      await app.httpRequest()
        .post('/api/v1/users/register')
        .send({
          username,
          email: `email1_${Date.now() + '_' + generateUniqueId()}@example.com`,
          password: 'password123',
        })
        .expect(201);

      const response = await app.httpRequest()
        .post('/api/v1/users/register')
        .send({
          username,
          email: `email2_${Date.now() + '_' + generateUniqueId()}@example.com`,
          password: 'password123',
        })
        .expect(400);

      assert(!response.body.success);
      assert(response.body.message === '用户名已存在');
    });

    it('should return 400 for duplicate email', async () => {
      const email = `duplicate_${Date.now() + '_' + generateUniqueId()}@example.com`;

      await app.httpRequest()
        .post('/api/v1/users/register')
        .send({
          username: 'user1_' + Date.now() + '_' + generateUniqueId(),
          email,
          password: 'password123',
        })
        .expect(201);

      const response = await app.httpRequest()
        .post('/api/v1/users/register')
        .send({
          username: 'user2_' + Date.now() + '_' + generateUniqueId(),
          email,
          password: 'password123',
        })
        .expect(400);

      assert(!response.body.success);
      assert(response.body.message === '邮箱已被注册');
    });
  });

  describe('POST /api/v1/users/login', () => {
    let testUser;

    beforeEach(async () => {
      // 创建测试用户
      const username = 'loginuser_' + Date.now() + '_' + generateUniqueId();
      const response = await app.httpRequest()
        .post('/api/v1/users/register')
        .send({
          username,
          email: `login_${Date.now() + '_' + generateUniqueId()}@example.com`,
          password: 'password123',
        })
        .expect(201);
      testUser = response.body.data;
    });

    it('should login with valid username and password', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/users/login')
        .send({
          username: testUser.username,
          password: 'password123',
        })
        .expect(200);

      assert(response.body.success);
      assert(response.body.data.user.username === testUser.username);
      assert(response.body.data.token);
      assert(!response.body.data.user.password);
    });

    it('should login with valid email and password', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/users/login')
        .send({
          username: testUser.email,
          password: 'password123',
        })
        .expect(200);

      assert(response.body.success);
      assert(response.body.data.token);
    });

    it('should return 401 for invalid username', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/users/login')
        .send({
          username: 'nonexistent_user',
          password: 'password123',
        })
        .expect(401);

      assert(!response.body.success);
      assert(response.body.message === '用户名或密码错误');
    });

    it('should return 401 for invalid password', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/users/login')
        .send({
          username: testUser.username,
          password: 'wrongpassword',
        })
        .expect(401);

      assert(!response.body.success);
      assert(response.body.message === '用户名或密码错误');
    });

    it('should return 400 without username', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/users/login')
        .send({
          password: 'password123',
        })
        .expect(400);

      assert(!response.body.success);
    });

    it('should return 400 without password', async () => {
      const response = await app.httpRequest()
        .post('/api/v1/users/login')
        .send({
          username: testUser.username,
        })
        .expect(400);

      assert(!response.body.success);
    });
  });

  describe('GET /api/v1/users/me', () => {
    it('should return current user info with valid token', async () => {
      // 先注册并登录
      const username = 'meuser_' + Date.now() + '_' + generateUniqueId();
      await app.httpRequest()
        .post('/api/v1/users/register')
        .send({
          username,
          email: `me_${Date.now() + '_' + generateUniqueId()}@example.com`,
          password: 'password123',
        });

      const loginResponse = await app.httpRequest()
        .post('/api/v1/users/login')
        .send({
          username,
          password: 'password123',
        });

      const token = loginResponse.body.data.token;

      const response = await app.httpRequest()
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      assert(response.body.success);
      assert(response.body.data.username === username);
    });

    it('should return 401 without token', async () => {
      const response = await app.httpRequest()
        .get('/api/v1/users/me')
        .expect(401);

      assert(!response.body.success);
    });
  });

  describe('PUT /api/v1/users/profile', () => {
    let token;

    beforeEach(async () => {
      const username = 'profileuser_' + Date.now() + '_' + generateUniqueId();
      await app.httpRequest()
        .post('/api/v1/users/register')
        .send({
          username,
          email: `profile_${Date.now() + '_' + generateUniqueId()}@example.com`,
          password: 'password123',
        })
        .expect(201);

      const loginResponse = await app.httpRequest()
        .post('/api/v1/users/login')
        .send({
          username,
          password: 'password123',
        })
        .expect(200);

      token = loginResponse.body.data.token;
    });

    it('should update user profile', async () => {
      const response = await app.httpRequest()
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nickname: 'Updated Nickname',
          bio: 'Updated bio',
        })
        .expect(200);

      assert(response.body.success);
      assert(response.body.data.nickname === 'Updated Nickname');
      assert(response.body.data.bio === 'Updated bio');
    });
  });

  describe('PUT /api/v1/users/password', () => {
    let token;
    let username;

    beforeEach(async () => {
      username = 'passworduser_' + Date.now() + '_' + generateUniqueId();
      await app.httpRequest()
        .post('/api/v1/users/register')
        .send({
          username,
          email: `password_${Date.now() + '_' + generateUniqueId()}@example.com`,
          password: 'oldpassword123',
        })
        .expect(201);

      const loginResponse = await app.httpRequest()
        .post('/api/v1/users/login')
        .send({
          username,
          password: 'oldpassword123',
        })
        .expect(200);

      token = loginResponse.body.data.token;
    });

    it('should change password with valid old password', async () => {
      const response = await app.httpRequest()
        .put('/api/v1/users/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          oldPassword: 'oldpassword123',
          newPassword: 'newpassword123',
        })
        .expect(200);

      assert(response.body.success);
      assert(response.body.message === '密码修改成功');

      // 用新密码登录
      await app.httpRequest()
        .post('/api/v1/users/login')
        .send({
          username,
          password: 'newpassword123',
        })
        .expect(200);
    });

    it('should return 400 for wrong old password', async () => {
      const response = await app.httpRequest()
        .put('/api/v1/users/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          oldPassword: 'wrongpassword',
          newPassword: 'newpassword123',
        })
        .expect(400);

      assert(!response.body.success);
      assert(response.body.message === '旧密码错误');
    });

    it('should return 400 for short new password', async () => {
      const response = await app.httpRequest()
        .put('/api/v1/users/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          oldPassword: 'oldpassword123',
          newPassword: '12345',
        })
        .expect(400);

      assert(!response.body.success);
      assert(response.body.message.includes('新密码长度'));
    });

    it('should return 400 without old password', async () => {
      const response = await app.httpRequest()
        .put('/api/v1/users/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          newPassword: 'newpassword123',
        })
        .expect(400);

      assert(!response.body.success);
    });

    it('should return 400 without new password', async () => {
      const response = await app.httpRequest()
        .put('/api/v1/users/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          oldPassword: 'oldpassword123',
        })
        .expect(400);

      assert(!response.body.success);
    });
  });
});
