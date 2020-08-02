const express = require('express');
const moment = require('moment');
const jwt = require('jwt-simple');
const { Models, commonErrorHandler } = require('../db');
const jwtParser = require('../middlewares/jwtParser');
const argsCheck = require('../middlewares/argsCheck');
const ERROR = require('../const/ERROR.json');

const router = express.Router();
const { Account, Address } = Models;

function createAddress(req, res, next, phone, password, deviceId, inviter) {
  Address.generate(phone, password, deviceId, inviter).then((address) => {
    if (!address) {
      res.json_error_code = ERROR.COMMON.code;
      res.json_error = ERROR.COMMON.message;
    }
    next();
  }).catch(commonErrorHandler.bind(this, req, res, next));
}

// 使用用户名密码新建账户
router.post('/user.json', argsCheck('phone', 'password', 'deviceId'), (req, res, next) => {
  const { phone, password, deviceId, inviteCode } = req.body;
  // TODO: 检查参数合法性
  if (phone[0] !== '0' && phone.length !== 11) {
    res.json_error_code = ERROR.REGISTER_PHONE.code;
    res.json_error = ERROR.REGISTER_PHONE.message;
    next();
    return;
  }
  // TODO: 检查邀请码
  if (inviteCode && inviteCode.length > 0) {
    Address.findOne({ where: { inviteCode } }).then((inviter) => {
      if (!inviter) {
        res.json_error_code = ERROR.REGISTER_INVITE.code;
        res.json_error = ERROR.REGISTER_INVITE.message;
        next();
      } else {
        createAddress(req, res, next, phone, password, deviceId, inviter.t);
      }
    });
  } else {
    createAddress(req, res, next, phone, password, deviceId);
  }
});

function login({ phone, password }, app) {
  return Address.findOne({ where: { phone, password } }).then((address) => {
    if (!address) {
      return null;
    }
    // 返回token
    const expires = moment().add(7, 'days').valueOf();
    const token = jwt.encode({
      iss: address.id,
      exp: expires,
    }, app.get('jwtTokenSecret'));
    return {
      token,
      expires,
    };
  });
}

router.post('/user/login.json', argsCheck('phone', 'password'), (req, res, next) => {
  const { phone, password } = req.body;
  login({ phone, password }, req.app).then((data) => {
    if (!data) {
      res.json_error_code = ERROR.LOGIN_FAIL.code;
      res.json_error = ERROR.LOGIN_FAIL.message;
      next();
      return;
    }
    res.json_data = data;
    next();
  });
});

router.get('/user.json', jwtParser, (req, res, next) => {
  const { jwt_address } = req;
  res.json_data = {
    ...jwt_address.getUser(),
  };
  next();
});

function getUserAccounts(t) {
  return Account.findAll({ where: { t } }).then((list) => {
    const ret = list.map((acc) => acc.getData());
    if (ret.length === 0) {
      ret.push({
        code: 'DIO',
        balance: 0,
      });
    }
    return ret;
  });
}

router.get('/user/accounts.json', jwtParser, (req, res, next) => {
  const { jwt_address } = req;
  getUserAccounts(jwt_address.t).then((list) => {
    res.json_data = list;
    next();
  });
});

module.exports = router;
module.exports.login = login;
module.exports.getUserAccounts = getUserAccounts;
