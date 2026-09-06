'use strict';

module.exports = app => {
  const { STRING, TEXT, INTEGER, BOOLEAN, DATE } = app.Sequelize;

  const Article = app.model.define('Article', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true, field: 'id' },
    title: { type: STRING(200), allowNull: false, comment: '文章标题', field: 'title' },
    slug: { type: STRING(200), allowNull: false, unique: true, comment: '文章别名', field: 'slug' },
    content: { type: TEXT, allowNull: false, comment: 'Markdown 内容', field: 'content' },
    htmlContent: { type: TEXT, allowNull: true, comment: 'HTML 内容（渲染后）', field: 'htmlContent' },
    excerpt: { type: STRING(500), allowNull: true, comment: '文章摘要', field: 'excerpt' },
    coverImage: { type: STRING(500), allowNull: true, comment: '封面图片', field: 'coverImage' },
    status: {
      type: STRING(20),
      allowNull: false,
      defaultValue: 'draft',
      comment: '状态: draft-草稿, published-已发布, archived-归档',
      field: 'status',
    },
    viewCount: { type: INTEGER, defaultValue: 0, comment: '浏览次数', field: 'viewCount' },
    likeCount: { type: INTEGER, defaultValue: 0, comment: '点赞次数', field: 'likeCount' },
    commentCount: { type: INTEGER, defaultValue: 0, comment: '评论次数', field: 'commentCount' },
    isTop: { type: BOOLEAN, defaultValue: false, comment: '是否置顶', field: 'isTop' },
    categoryId: { type: INTEGER, allowNull: true, comment: '分类ID', field: 'categoryId' },
    authorId: { type: INTEGER, allowNull: false, comment: '作者ID', field: 'authorId' },
  }, {
    tableName: 'articles',
    underscored: false,
    indexes: [
      { fields: [ 'status' ] },
      { fields: [ 'categoryId' ] },
      { fields: [ 'slug' ] },
      { fields: [ 'createdAt' ] },
    ],
  });

  Article.associate = function() {
    // 关联分类
    app.model.Article.belongsTo(app.model.Category, { foreignKey: 'categoryId', as: 'category' });

    // 关联标签（多对多）
    app.model.Article.belongsToMany(app.model.Tag, {
      through: 'article_tags',
      foreignKey: 'articleId',
      otherKey: 'tagId',
      as: 'tags',
    });

    // 关联评论
    app.model.Article.hasMany(app.model.Comment, { foreignKey: 'articleId', as: 'comments' });

    // 关联作者
    app.model.Article.belongsTo(app.model.User, { foreignKey: 'authorId', as: 'author' });
  };

  return Article;
};
