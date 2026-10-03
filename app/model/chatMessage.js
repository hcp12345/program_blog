'use strict';

module.exports = app => {
  const { STRING, INTEGER, TEXT, JSON: JSONTYPE } = app.Sequelize;

  const ChatMessage = app.model.define('ChatMessage', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    sessionId: { type: INTEGER, allowNull: false, comment: '会话ID' },
    role: { type: STRING(20), allowNull: false, comment: '角色: user / assistant / tool' },
    content: { type: TEXT, allowNull: true, comment: '消息内容' },
    toolName: { type: STRING(50), allowNull: true, comment: '工具名（role=tool 时）' },
    toolArgs: { type: JSONTYPE, allowNull: true, comment: '工具入参（role=tool 时）' },
    tokens: { type: INTEGER, defaultValue: 0, comment: 'token 消耗' },
  }, {
    tableName: 'chat_messages',
    indexes: [
      { fields: [ 'sessionId' ] },
      { fields: [ 'createdAt' ] },
    ],
  });

  ChatMessage.associate = function() {
    app.model.ChatMessage.belongsTo(app.model.ChatSession, { foreignKey: 'sessionId', as: 'session' });
  };

  return ChatMessage;
};
