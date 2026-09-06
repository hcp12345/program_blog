'use strict';

module.exports = app => {
  const { STRING, INTEGER, TEXT } = app.Sequelize;

  const Category = app.model.define('Category', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: STRING(50), allowNull: false, unique: true, comment: '分类名称' },
    slug: { type: STRING(50), allowNull: false, unique: true, comment: '分类别名' },
    description: { type: STRING(500), allowNull: true, comment: '分类描述' },
    icon: { type: STRING(100), allowNull: true, comment: '图标' },
    parentId: { type: INTEGER, allowNull: true, comment: '父分类ID' },
    sort: { type: INTEGER, defaultValue: 0, comment: '排序' },
  }, {
    tableName: 'categories',
    indexes: [
      { fields: [ 'slug' ] },
      { fields: [ 'parentId' ] },
    ],
  });

  Category.associate = function() {
    // 关联文章
    app.model.Category.hasMany(app.model.Article, { foreignKey: 'categoryId', as: 'articles' });

    // 自关联（父子分类）
    app.model.Category.belongsTo(app.model.Category, { foreignKey: 'parentId', as: 'parent' });
    app.model.Category.hasMany(app.model.Category, { foreignKey: 'parentId', as: 'children' });
  };

  return Category;
};
