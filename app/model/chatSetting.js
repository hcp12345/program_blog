'use strict';

module.exports = app => {
  const { STRING } = app.Sequelize;

  // 智能客服配置表（key-value），后台可视化调整
  const ChatSetting = app.model.define('ChatSetting', {
    key: { type: STRING(50), primaryKey: true, field: 'key', comment: '配置键' },
    value: { type: STRING(200), allowNull: false, field: 'value', comment: '配置值' },
  }, {
    tableName: 'chat_settings',
  });

  return ChatSetting;
};
