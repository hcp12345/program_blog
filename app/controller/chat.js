'use strict';

const { Controller } = require('egg');
const { Op } = require('sequelize');

const HISTORY_LIMIT = 10;

class ChatController extends Controller {
  // ---------- 工具方法 ----------

  get agentService() {
    return this.ctx.service.agent;
  }

  get role() {
    const user = this.ctx.state.user;
    return user && user.role === 'admin' ? 'admin' : 'guest';
  }

  get clientIp() {
    const { ctx } = this;
    return ctx.get('x-forwarded-for')?.split(',')[0].trim() || ctx.ip;
  }

  // 写入 SSE 事件
  sseWrite(event, data) {
    this.ctx.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }

  // ---------- 对话接口（SSE） ----------

  async chat() {
    const { ctx } = this;
    const { message, sessionId } = ctx.request.body || {};

    if (!message || !String(message).trim()) {
      ctx.status = 400;
      ctx.body = { success: false, message: '消息内容不能为空' };
      return;
    }
    if (String(message).length > 2000) {
      ctx.status = 400;
      ctx.body = { success: false, message: '单条消息不能超过 2000 字' };
      return;
    }

    const role = this.role;
    const ip = this.clientIp;

    // 1. 限流（管理员不计数）
    if (role !== 'admin') {
      const limit = parseInt(await this.agentService.getSetting(ctx, 'rate_limit_per_ip_per_day')) || 50;
      if (limit > 0) {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const used = await ctx.model.ChatMessage.count({
          include: [{ model: ctx.model.ChatSession, as: 'session', where: { ip }, attributes: [] }],
          where: { role: 'user', createdAt: { [Op.gte]: start } },
        });
        if (used >= limit) {
          ctx.status = 429;
          ctx.body = {
            success: false,
            message: `今日对话次数已达上限（${limit} 次），欢迎明天再来 🙌`,
            data: { limit, used },
          };
          return;
        }
      }
    }

    // 2. 会话准备
    let session = null;
    if (sessionId) {
      session = await ctx.model.ChatSession.findByPk(sessionId);
      if (!session) {
        ctx.status = 404;
        ctx.body = { success: false, message: '会话不存在' };
        return;
      }
      const isMine = ctx.state.user
        ? session.userId === ctx.state.user.userId
        : session.ip === ip;
      if (!isMine && role !== 'admin') {
        ctx.status = 403;
        ctx.body = { success: false, message: '无权访问该会话' };
        return;
      }
    } else {
      session = await ctx.model.ChatSession.create({
        userId: ctx.state.user ? ctx.state.user.userId : null,
        ip,
        title: String(message).replace(/\s+/g, ' ').slice(0, 20),
      });
    }

    // 3. 保存用户消息
    await ctx.model.ChatMessage.create({
      sessionId: session.id,
      role: 'user',
      content: String(message),
    });

    // 4. 历史（仅取 user / assistant 文本，跳过 tool 记录）
    const historyRows = await ctx.model.ChatMessage.findAll({
      where: { sessionId: session.id, role: [ 'user', 'assistant' ], content: { [Op.ne]: null } },
      order: [[ 'id', 'DESC' ]],
      limit: HISTORY_LIMIT + 1,
    });
    const history = historyRows
      .reverse()
      .slice(0, -1) // 去掉刚保存的当前消息
      .filter(m => m.content)
      .map(m => ({ role: m.role, content: m.content }));

    // 5. 进入 SSE 模式
    ctx.respond = false;
    ctx.res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    this.sseWrite('start', { sessionId: session.id, title: session.title });

    try {
      const defaultPublishMode = await this.agentService.getSetting(ctx, 'draft_publish_mode');

      const { answer, toolLog, tokens } = await this.agentService.runAgent(ctx, {
        role,
        message: String(message),
        history,
        defaultPublishMode,
        onDelta: text => this.sseWrite('delta', { text }),
        onTool: (name, args) => this.sseWrite('tool', { name, args }),
      });

      // 6. 落库：工具调用记录 + 助手回答
      for (const log of toolLog) {
        await ctx.model.ChatMessage.create({
          sessionId: session.id,
          role: 'tool',
          content: JSON.stringify(log.result).slice(0, 4000),
          toolName: log.name,
          toolArgs: log.args,
        });
      }

      const assistantMsg = await ctx.model.ChatMessage.create({
        sessionId: session.id,
        role: 'assistant',
        content: answer || '（没有生成内容，请重试）',
        tokens,
      });

      // 刷新会话活跃时间，便于会话列表按最近使用排序
      await session.update({ updatedAt: new Date() });

      this.sseWrite('done', { messageId: assistantMsg.id, sessionId: session.id, tokens });
      ctx.res.end();
    } catch (error) {
      ctx.logger.error('[chat] Agent 执行失败: %s', error.stack || error.message);

      let tip = '抱歉，智能助手暂时不可用，请稍后再试。';
      if (error.code === 'NO_API_KEY') {
        tip = '智能客服尚未配置：请在服务端设置环境变量 ZHIPU_API_KEY 后重启。';
      } else if (error.status === 429) {
        tip = '模型服务当前繁忙（触发限流），请稍后再试。';
      } else if (error.status === 401 || error.status === 403) {
        tip = '模型服务鉴权失败，请检查 ZHIPU_API_KEY 是否正确。';
      } else if (error.name === 'AbortError') {
        tip = '模型响应超时，请重试或简化问题。';
      }

      this.sseWrite('error', { message: tip });
      ctx.res.end();
    }
  }

  // ---------- 会话管理 ----------

  async sessions() {
    const { ctx } = this;
    const where = ctx.state.user ? { userId: ctx.state.user.userId } : { ip: this.clientIp };

    const list = await ctx.model.ChatSession.findAll({
      where,
      order: [[ 'updatedAt', 'DESC' ]],
      limit: 30,
    });

    const data = [];
    for (const s of list) {
      const last = await ctx.model.ChatMessage.findOne({
        where: { sessionId: s.id, role: 'user' },
        order: [[ 'id', 'DESC' ]],
      });
      const count = await ctx.model.ChatMessage.count({ where: { sessionId: s.id, role: 'user' } });
      data.push({ id: s.id, title: s.title, messageCount: count, lastMessage: last ? last.content.slice(0, 50) : '', updatedAt: s.updatedAt });
    }

    ctx.body = { success: true, data };
  }

  async messages() {
    const { ctx } = this;
    const { id } = ctx.params;

    const session = await ctx.model.ChatSession.findByPk(id);
    if (!session) {
      ctx.status = 404;
      ctx.body = { success: false, message: '会话不存在' };
      return;
    }
    const isMine = ctx.state.user ? session.userId === ctx.state.user.userId : session.ip === this.clientIp;
    if (!isMine && this.role !== 'admin') {
      ctx.status = 403;
      ctx.body = { success: false, message: '无权访问该会话' };
      return;
    }

    const rows = await ctx.model.ChatMessage.findAll({
      where: { sessionId: id, role: [ 'user', 'assistant' ] },
      order: [[ 'id', 'ASC' ]],
    });

    ctx.body = {
      success: true,
      data: { session: { id: session.id, title: session.title }, list: rows },
    };
  }

  async destroySession() {
    const { ctx } = this;
    const { id } = ctx.params;

    const session = await ctx.model.ChatSession.findByPk(id);
    if (!session) {
      ctx.status = 404;
      ctx.body = { success: false, message: '会话不存在' };
      return;
    }
    const isMine = ctx.state.user ? session.userId === ctx.state.user.userId : session.ip === this.clientIp;
    if (!isMine && this.role !== 'admin') {
      ctx.status = 403;
      ctx.body = { success: false, message: '无权操作该会话' };
      return;
    }

    await ctx.model.ChatMessage.destroy({ where: { sessionId: id } });
    await session.destroy();

    ctx.body = { success: true, message: '会话已删除' };
  }

  // ---------- 配置（管理员） ----------

  assertAdmin() {
    const { ctx } = this;
    if (this.role !== 'admin') {
      ctx.status = 403;
      ctx.body = { success: false, message: '需要管理员权限' };
      return false;
    }
    return true;
  }

  async getSettings() {
    if (!this.assertAdmin()) return;
    const settings = await this.agentService.getSettings(this.ctx);
    this.ctx.body = {
      success: true,
      data: {
        rateLimitPerIpPerDay: parseInt(settings.rate_limit_per_ip_per_day),
        draftPublishMode: settings.draft_publish_mode,
        model: this.ctx.app.config.llm.model,
        apiKeyConfigured: !!this.ctx.app.config.llm.apiKey,
      },
    };
  }

  async updateSettings() {
    if (!this.assertAdmin()) return;
    const { ctx } = this;
    const { rateLimitPerIpPerDay, draftPublishMode } = ctx.request.body || {};

    const payload = {};
    if (rateLimitPerIpPerDay !== undefined) {
      const n = parseInt(rateLimitPerIpPerDay);
      if (isNaN(n) || n < 0) {
        ctx.status = 400;
        ctx.body = { success: false, message: '限流阈值必须为不小于 0 的整数（0 表示不限制）' };
        return;
      }
      payload.rate_limit_per_ip_per_day = String(n);
    }
    if (draftPublishMode !== undefined) {
      if (![ 'auto', 'manual' ].includes(draftPublishMode)) {
        ctx.status = 400;
        ctx.body = { success: false, message: '发布模式仅支持 auto 或 manual' };
        return;
      }
      payload.draft_publish_mode = draftPublishMode;
    }

    const result = await this.agentService.setSettings(ctx, payload);
    ctx.body = { success: true, data: result, message: '配置已更新' };
  }

  // ---------- 客服质检（管理员） ----------

  async adminSessions() {
    if (!this.assertAdmin()) return;
    const { ctx } = this;
    const { keyword, page = 1, pageSize = 20 } = ctx.query;

    const sessionWhere = {};
    const include = [{
      model: ctx.model.ChatMessage, as: 'messages',
      attributes: [ 'id', 'role', 'content', 'toolName', 'createdAt' ],
      separate: true,
      order: [[ 'id', 'ASC' ]],
    }];

    // 关键词：命中会话标题或消息内容
    if (keyword) {
      const like = `%${keyword}%`;
      const hitSessions = await ctx.model.ChatMessage.findAll({
        attributes: [ 'sessionId' ],
        where: { content: { [Op.like]: like } },
        group: [ 'sessionId' ],
        limit: 200,
      });
      const ids = hitSessions.map(r => r.sessionId);
      sessionWhere[Op.or] = [
        { title: { [Op.like]: like } },
        { id: ids.length ? { [Op.in]: ids } : 0 },
      ];
    }

    const result = await ctx.model.ChatSession.findAndCountAll({
      where: sessionWhere,
      include,
      order: [[ 'updatedAt', 'DESC' ]],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
    });

    ctx.body = {
      success: true,
      data: {
        list: result.rows.map(s => ({
          id: s.id,
          title: s.title,
          ip: s.ip,
          userId: s.userId,
          updatedAt: s.updatedAt,
          toolCalls: s.messages.filter(m => m.role === 'tool').length,
          messages: s.messages.filter(m => m.role !== 'tool').map(m => ({
            role: m.role, content: m.content, createdAt: m.createdAt,
          })),
        })),
        total: result.count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
      },
    };
  }
}

module.exports = ChatController;
