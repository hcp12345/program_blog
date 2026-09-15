// This file is created by egg-ts-helper@2.1.1
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportJwtAuth = require('../../../app/middleware/jwt_auth');

declare module 'egg' {
  interface IMiddleware {
    jwtAuth: typeof ExportJwtAuth;
  }
}
