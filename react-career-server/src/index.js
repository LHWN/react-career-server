/**
 * Front : React
 * Back : Koa
 */
require('dotenv').config();

const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();
const api = require('./api');

const mongoose = require('mongoose');
const bodyParser = require('koa-bodyparser');

const crypto = require('crypto');

const password = 'abc123';
const secret = 'MySecretKey1$1$1234';

const hashed = crypto.createHmac('sha256', secret).update(password).digest('hex');

const jwt = require('jsonwebtoken');
const { jwtMiddleware } = require('./lib/token');

console.log(hashed);

const token = jwt.sign({ foo: 'bar' }, 'secret-key', { expiresIn: '7d' }, (err, token) => {
  if (err) {
    console.log(err);
    return;
  }

  console.log(token);
});

mongoose.Promise = global.Promise;

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((response) => {
    console.log('Successfully connected to mongodb');
  })
  .catch((e) => {
    console.error(e);
  });

const port = process.env.PORT || 4000;

app.use(bodyParser());
app.use(jwtMiddleware); // 미들웨어를 적용해줌으로써 라우터 핸들러에서 ctx.request.user 를 조회하면 유저정보가 반환됨

router.use('/api', api.routes());
app.use(router.routes()).use(router.allowedMethods());

app.listen(4000, () => {
  console.log('heurm server');
});

/**
 * Start mongod server :
 * (1) mongod
 * or
 * (2) mongod --dbpath ./db
 * Start dev server : yarn start:dev
 */
