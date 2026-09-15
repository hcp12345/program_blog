// This file is created by egg-ts-helper@2.1.1
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportArticle = require('../../../app/controller/article');
import ExportCategory = require('../../../app/controller/category');
import ExportComment = require('../../../app/controller/comment');
import ExportHome = require('../../../app/controller/home');
import ExportSearch = require('../../../app/controller/search');
import ExportTag = require('../../../app/controller/tag');
import ExportUser = require('../../../app/controller/user');

declare module 'egg' {
  interface IController {
    article: ExportArticle;
    category: ExportCategory;
    comment: ExportComment;
    home: ExportHome;
    search: ExportSearch;
    tag: ExportTag;
    user: ExportUser;
  }
}
