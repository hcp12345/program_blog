'use strict';

module.exports = app => {
  const { STRING, TEXT, INTEGER, BOOLEAN } = app.Sequelize;

  const Comment = app.model.define('Comment', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    content: { type: TEXT, allowNull: false, comment: '评论内容' },
    authorName: { type: STRING(50), allowNull: false, comment: '评论者名称' },
    authorEmail: { type: STRING(100), allowNull: false, comment: '评论者邮箱' },
    authorUrl: { type: STRING(200), allowNull: true, comment: '评论者网址' },
    authorIp: { type: STRING(50), allowNull: true, comment: '评论者IP' },
    authorAvatar: { type: STRING(200), allowNull: true, comment: '评论者头像' },
    parentId: { type: INTEGER, allowNull: true, comment: '父评论ID' },
    articleId: { type: INTEGER, allowNull: false, comment: '文章ID' },
    status: {
      type: STRING(20),
      allowNull: false,
      defaultValue: 'pending',
      comment: '状态: pending-待审核, approved-已批准, rejected-已拒绝',
    },
    likeCount: { type: INTEGER, defaultValue: 0, comment: '点赞次数' },
  }, {
    tableName: 'comments',
    indexes: [
      { fields: [ 'articleId' ] },
      { fields: [ 'status' ] },
      { fields: [ 'parentId' ] },
    ],
  });

  Comment.associate = function() {
    // 关联文章
    app.model.Comment.belongsTo(app.model.Article, { foreignKey: 'articleId', as: 'article' });

    // 自关联（回复评论）
    app.model.Comment.belongsTo(app.model.Comment, { foreignKey: 'parentId', as: 'parent' });
    app.model.Comment.hasMany(app.model.Comment, { foreignKey: 'parentId', as: 'replies' });
  };

  return Comment;
};
