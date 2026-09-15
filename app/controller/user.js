'use strict';

const Controller = require('egg').Controller;
const bcrypt = require('bcryptjs');

class UserController extends Controller {
  // 用户注册
  async register() {
    const { ctx } = this;
    const { username, email, password, nickname } = ctx.request.body;

    // 验证必填字段
    if (!username || !email || !password) {
      ctx.body = {
        success: false,
        message: '用户名、邮箱和密码不能为空',
      };
      ctx.status = 400;
      return;
    }

    // 验证用户名格式
    if (username.length < 3 || username.length > 20) {
      ctx.body = {
        success: false,
        message: '用户名长度必须在 3-20 个字符之间',
      };
      ctx.status = 400;
      return;
    }

    // 验证密码长度
    if (password.length < 6) {
      ctx.body = {
        success: false,
        message: '密码长度不能少于 6 个字符',
      };
      ctx.status = 400;
      return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      ctx.body = {
        success: false,
        message: '邮箱格式不正确',
      };
      ctx.status = 400;
      return;
    }

    try {
      // 检查用户名是否已存在
      const existingUser = await ctx.model.User.findOne({
        where: {
          [ctx.model.Sequelize.Op.or]: [{ username }, { email }],
        },
      });

      if (existingUser) {
        ctx.body = {
          success: false,
          message: existingUser.username === username ? '用户名已存在' : '邮箱已被注册',
        };
        ctx.status = 400;
        return;
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建用户
      const user = await ctx.model.User.create({
        username,
        email,
        password: hashedPassword,
        nickname: nickname || username,
      });

      // 返回用户信息（不包含密码）
      // eslint-disable-next-line no-unused-vars
      const { password: _, ...userWithoutPassword } = user.toJSON();
      ctx.body = {
        success: true,
        data: userWithoutPassword,
        message: '注册成功',
      };
      ctx.status = 201;
    } catch (error) {
      ctx.body = {
        success: false,
        message: '注册失败：' + error.message,
      };
      ctx.status = 500;
    }
  }

  // 用户登录
  async login() {
    const { ctx, app } = this;
    const { username, password } = ctx.request.body;

    // 验证必填字段
    if (!username || !password) {
      ctx.body = {
        success: false,
        message: '用户名和密码不能为空',
      };
      ctx.status = 400;
      return;
    }

    try {
      // 查找用户（支持用户名或邮箱登录）
      const user = await ctx.model.User.findOne({
        where: {
          [ctx.model.Sequelize.Op.or]: [{ username }, { email: username }],
        },
      });

      if (!user) {
        ctx.body = {
          success: false,
          message: '用户名或密码错误',
        };
        ctx.status = 401;
        return;
      }

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        ctx.body = {
          success: false,
          message: '用户名或密码错误',
        };
        ctx.status = 401;
        return;
      }

      // 生成 JWT token
      const token = app.jwt.sign({
        userId: user.id,
        username: user.username,
        role: user.role,
      }, app.config.jwt.secret, {
        expiresIn: app.config.jwt.expiresIn,
      });

      // 返回用户信息和 token
      // eslint-disable-next-line no-unused-vars
      const { password: _, ...userWithoutPassword } = user.toJSON();
      ctx.body = {
        success: true,
        data: {
          user: userWithoutPassword,
          token,
        },
        message: '登录成功',
      };
    } catch (error) {
      ctx.body = {
        success: false,
        message: '登录失败：' + error.message,
      };
      ctx.status = 500;
    }
  }

  // 获取当前登录用户信息
  async getCurrentUser() {
    const { ctx } = this;
    const userId = ctx.state.user?.userId;

    if (!userId) {
      ctx.body = {
        success: false,
        message: '未登录或登录已过期',
      };
      ctx.status = 401;
      return;
    }

    try {
      const user = await ctx.model.User.findByPk(userId, {
        attributes: { exclude: [ 'password' ] },
      });

      if (!user) {
        ctx.body = {
          success: false,
          message: '用户不存在',
        };
        ctx.status = 404;
        return;
      }

      ctx.body = {
        success: true,
        data: user,
      };
    } catch (error) {
      ctx.body = {
        success: false,
        message: '获取用户信息失败：' + error.message,
      };
      ctx.status = 500;
    }
  }

  // 更新用户信息
  async updateProfile() {
    const { ctx } = this;
    const userId = ctx.state.user?.userId;

    if (!userId) {
      ctx.body = {
        success: false,
        message: '未登录或登录已过期',
      };
      ctx.status = 401;
      return;
    }

    const { nickname, bio, avatar } = ctx.request.body;

    try {
      const user = await ctx.model.User.findByPk(userId);
      if (!user) {
        ctx.body = {
          success: false,
          message: '用户不存在',
        };
        ctx.status = 404;
        return;
      }

      // 更新用户信息
      if (nickname !== undefined) user.nickname = nickname;
      if (bio !== undefined) user.bio = bio;
      if (avatar !== undefined) user.avatar = avatar;

      await user.save();

      // eslint-disable-next-line no-unused-vars
      const { password: _, ...userWithoutPassword } = user.toJSON();
      ctx.body = {
        success: true,
        data: userWithoutPassword,
        message: '更新成功',
      };
    } catch (error) {
      ctx.body = {
        success: false,
        message: '更新失败：' + error.message,
      };
      ctx.status = 500;
    }
  }

  // 修改密码
  async changePassword() {
    const { ctx } = this;
    const userId = ctx.state.user?.userId;

    if (!userId) {
      ctx.body = {
        success: false,
        message: '未登录或登录已过期',
      };
      ctx.status = 401;
      return;
    }

    const { oldPassword, newPassword } = ctx.request.body;

    if (!oldPassword || !newPassword) {
      ctx.body = {
        success: false,
        message: '旧密码和新密码不能为空',
      };
      ctx.status = 400;
      return;
    }

    if (newPassword.length < 6) {
      ctx.body = {
        success: false,
        message: '新密码长度不能少于 6 个字符',
      };
      ctx.status = 400;
      return;
    }

    try {
      const user = await ctx.model.User.findByPk(userId);
      if (!user) {
        ctx.body = {
          success: false,
          message: '用户不存在',
        };
        ctx.status = 404;
        return;
      }

      // 验证旧密码
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        ctx.body = {
          success: false,
          message: '旧密码错误',
        };
        ctx.status = 400;
        return;
      }

      // 加密新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      ctx.body = {
        success: true,
        message: '密码修改成功',
      };
    } catch (error) {
      ctx.body = {
        success: false,
        message: '密码修改失败：' + error.message,
      };
      ctx.status = 500;
    }
  }
}

module.exports = UserController;
