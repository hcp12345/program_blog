// This file is created by egg-ts-helper@2.1.1
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportArticle = require('../../../app/model/article');
import ExportCategory = require('../../../app/model/category');
import ExportChatMessage = require('../../../app/model/chatMessage');
import ExportChatSession = require('../../../app/model/chatSession');
import ExportChatSetting = require('../../../app/model/chatSetting');
import ExportComment = require('../../../app/model/comment');
import ExportTag = require('../../../app/model/tag');
import ExportUser = require('../../../app/model/user');

declare module 'egg' {
  interface IModel {
    Article: ReturnType<typeof ExportArticle>;
    Category: ReturnType<typeof ExportCategory>;
    ChatMessage: ReturnType<typeof ExportChatMessage>;
    ChatSession: ReturnType<typeof ExportChatSession>;
    ChatSetting: ReturnType<typeof ExportChatSetting>;
    Comment: ReturnType<typeof ExportComment>;
    Tag: ReturnType<typeof ExportTag>;
    User: ReturnType<typeof ExportUser>;
  }
}
