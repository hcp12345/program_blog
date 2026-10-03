'use strict';

module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize;

  const ChatSession = app.model.define('ChatSession', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: INTEGER, allowNull: true, comment: '用户ID，游客为 NULL' },
    ip: { type: STRING(50), allowNull: true, comment: '访客 IP，用于限流与质检溯源' },
    title: { type: STRING(200), allowNull: true, defaultValue: '新对话', comment: '会话标题' },
  }, {
    tableName: 'chat_sessions',
  });

  ChatSession.associate = function() {
    app.model.ChatSession.hasMany(app.model.ChatMessage, { foreignKey: 'sessionId', as: 'messages' });
  };

  return ChatSession;
};
