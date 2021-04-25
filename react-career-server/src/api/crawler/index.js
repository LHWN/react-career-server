const Router = require('koa-router');
const crawler = new Router();
const crawlerCtrl = require('./blog.controller');

crawler.get('/crawlBlog', crawlerCtrl.crawlBlog);
console.log('crawler/index.js');

module.exports = crawler;
