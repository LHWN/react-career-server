const Joi = require('joi');
const Account = require('../../models/account');

// 로컬 회원가입
exports.localRegister = async (ctx) => {
  console.log('this.localRegister');
  // 데이터 검증
  const schema = Joi.object().keys({
    username: Joi.string().alphanum().min(4).max(15).required(),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6)
  });

  const result = schema.validate(ctx.request.body);

  // 스키마 검증 실패
  if (result.error) {
    ctx.status = 400;
    console.log('Invalid Schema: ' + result.error);
    return;
  }

  // 아이디 / 이메일 중복 체크
  let existing = null;
  try {
    existing = await Account.findByEmailOrUsername(ctx.request.body);
  } catch (e) {
    ctx.throw(500, e);
  }

  if (existing) {
    ctx.status = 409;
    ctx.body = {
      key: existing.email === ctx.request.body.email ? 'email' : 'username'
    };
    return;
  }

  // 계정 생성
  let account = null;
  try {
    account = await Account.localRegister(ctx.request.body);
  } catch (e) {
    ctx.throw(500, e);
  }

  let token = null;
  try {
    token = await account.generateToken();
  } catch (e) {
    ctx.throw(500, e);
  }

  ctx.cookies.set('access_token', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 });
  ctx.body = account.profile;
};

// 로컬 로그인
exports.localLogin = async (ctx) => {
  // 데이터 검증
  const schema = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const result = schema.validate(ctx.request.body);

  if (result.error) {
    ctx.status = 400;
    return;
  }

  const { email, password } = ctx.request.body;

  let account = null;
  try {
    account = await Account.findByEmail(email);
  } catch (e) {
    ctx.throw(500, e);
  }
  // 유저가 존재하지 않거나 비밀번호가 일치하지 않으면
  if (!account || !account.validatePassword(password)) {
    ctx.status = 403;
    return;
  }

  let token = null;
  try {
    token = await account.generateToken();
  } catch (e) {
    ctx.throw(500, e);
  }
  console.log(ctx);
  ctx.cookies.set('access_token', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 });
  ctx.body = account.profile;
};

// 이메일 / 아이디 존재유무 확인
exports.exists = async (ctx) => {
  const { key, value } = ctx.params;
  let account = null;

  try {
    account = await (key === 'email' ? Account.findByEmail(value) : Account.findByUsername(value));
  } catch (e) {
    ctx.throw(500, e);
  }

  ctx.body = {
    exists: account !== null
  };
};

// 로그아웃
exports.logout = async (ctx) => {
  ctx.cookies.set('access_token', null, { maxAge: 0, httpOnly: true });
  ctx.status = 204;
};

// 쿠키에 access_token 이 있을 경우 현재 로그인된 유저의 정보
exports.check = (ctx) => {
  const { user } = ctx.request;
  console.log('ctx' + JSON.stringify(user));

  console.log('user.profile  ' + JSON.stringify(user.profile));
  if (!user) {
    ctx.status = 403;
    return;
  }

  ctx.body = user.profile;
  console.log('ctx.body' + JSON.stringify(ctx.body));
};
