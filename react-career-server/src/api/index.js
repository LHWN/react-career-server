const Router = require('koa-router');

const api = new Router();
const auth = require('./auth');
const crawler = require('./crawler');

api.use('/auth', auth.routes());
api.use('/crawler', crawler.routes());

module.exports = api;
