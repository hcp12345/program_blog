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
  config.keys = appInfo.name + '_1769959426400_1880';

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

  // 数据库配置
  config.sequelize = {
    dialect: 'mysql',
    host: 'localhost',
    port: 3306,
    database: 'md_me_blog',
    username: 'root',
    password: '123456',
    timezone: '+08:00',
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true,
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
    secret: 'md-blog-jwt-secret-key-change-in-production',
    expiresIn: '7d',
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
