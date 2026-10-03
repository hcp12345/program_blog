/* eslint valid-jsdoc: "off" */

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = process.env.APP_KEYS || (appInfo.name + '_1769959426400_1880');

  // add your middleware config here
  config.middleware = [ 'jwtAuth' ];

  // JWT 认证中间件配置（可选的路径白名单）
  config.jwtAuth = {
    // 这些路径不需要认证
    whiteList: [
      '/api/v1/users/login',
      '/api/v1/users/register',
      '/api/v1/articles',
      '/api/v1/categories',
      '/api/v1/tags',
      '/api/v1/comments',
      '/api/v1/search',
      '/health',
    ],
  };

  // 数据库配置（支持环境变量注入，便于 Docker / 生产部署）
  config.sequelize = {
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME || 'md_me_blog',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    timezone: '+08:00',
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true,
    },
  };

  // 服务监听端口（容器内可通过 PORT 覆盖，默认 7001）
  config.cluster = {
    listen: {
      port: Number(process.env.PORT || 7001),
    },
  };

  // CORS 配置
  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
  };

  // 安全配置
  config.security = {
    csrf: {
      enable: false,
    },
  };

  // JWT 配置
  config.jwt = {
    secret: process.env.JWT_SECRET || 'md-blog-jwt-secret-key-change-in-production',
    expiresIn: '7d',
  };

  // AI 智能客服（LLM）配置
  // 默认使用智谱 GLM（OpenAI 兼容协议），备选通义千问：改 baseURL + apiKey 环境变量即可
  config.llm = {
    baseURL: process.env.LLM_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4',
    apiKey: process.env.ZHIPU_API_KEY || '', // 密钥请通过环境变量 ZHIPU_API_KEY 或 config/config.local.js 注入，勿提交
    model: process.env.LLM_MODEL || 'glm-4-flash',
    temperature: 0.7,
    maxTokens: 2048,
    timeout: 90000,
    maxToolRounds: 5, // 单次对话最大工具调用轮数，防死循环
  };

  // 智能客服默认配置（实际值存 chat_settings 表，后台可调）
  config.chat = {
    defaultRateLimitPerIpPerDay: 50,
    defaultDraftPublishMode: 'manual', // manual 人工确认 / auto 自动发布
  };

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
