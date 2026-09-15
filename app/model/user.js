'use strict';

module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize;

  const User = app.model.define('User', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: STRING(50), allowNull: false, unique: true, comment: '用户名' },
    email: { type: STRING(100), allowNull: false, unique: true, comment: '邮箱' },
    password: { type: STRING(200), allowNull: false, comment: '密码（加密）' },
    nickname: { type: STRING(50), allowNull: true, comment: '昵称' },
    avatar: { type: STRING(200), allowNull: true, comment: '头像' },
    bio: { type: STRING(500), allowNull: true, comment: '个人简介' },
    role: {
      type: STRING(20),
      allowNull: false,
      defaultValue: 'user',
      comment: '角色: admin-管理员, user-普通用户',
    },
  }, {
    tableName: 'users',
    indexes: [
      { fields: [ 'username' ] },
      { fields: [ 'email' ] },
    ],
  });

  User.associate = function() {
    // 关联文章
    app.model.User.hasMany(app.model.Article, { foreignKey: 'authorId', as: 'articles' });
  };

  return User;
};
