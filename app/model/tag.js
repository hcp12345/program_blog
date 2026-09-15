'use strict';

module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize;

  const Tag = app.model.define('Tag', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: STRING(50), allowNull: false, unique: true, comment: '标签名称' },
    slug: { type: STRING(50), allowNull: false, unique: true, comment: '标签别名' },
    description: { type: STRING(500), allowNull: true, comment: '标签描述' },
    color: { type: STRING(20), allowNull: true, comment: '标签颜色' },
    articleCount: { type: INTEGER, defaultValue: 0, comment: '文章数量' },
  }, {
    tableName: 'tags',
    indexes: [
      { fields: [ 'slug' ] },
    ],
  });

  Tag.associate = function() {
    // 关联文章（多对多）
    app.model.Tag.belongsToMany(app.model.Article, {
      through: 'article_tags',
      foreignKey: 'tagId',
      otherKey: 'articleId',
      as: 'articles',
    });
  };

  return Tag;
};
