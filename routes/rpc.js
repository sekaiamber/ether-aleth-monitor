const express = require('express');
const md5 = require('md5-node');
const qs = require('qs');
const ERROR = require('../const/ERROR.json');
const { login, getUserAccounts } = require('./user');

// const { Models, commonErrorHandler } = require('../db');
const jsonpParser = require('../middlewares/jwtParser').jsonp;
// const jwtParser = require('../middlewares/jwtParser');

// const { Announcement, Deposit } = Models;
const DIO_KEY = process.env.DIO_KEY || 'DIO';

const router = express.Router();

/* GET home page. */
router.get('/call', jsonpParser, (req, res) => {
  // 检查
  const { seed, auth, method, args = '' } = req.query;

  const trueAuth = md5(`${method}|${seed}|${DIO_KEY}`);

  if (auth !== trueAuth) {
    res.jsonp({
      success: false,
      error: {
        code: ERROR.RPC_AUTH.code,
        message: ERROR.RPC_AUTH.message,
      },
    });
    return;
  }

  // 调用路由
  const params = qs.parse(decodeURIComponent(args));

  if (method === 'login') {
    login(params, req.app).then((data) => {
      const ret = {
        success: true,
      };
      if (!data) {
        ret.success = false;
        ret.error = {
          code: ERROR.LOGIN_FAIL.code,
          message: ERROR.LOGIN_FAIL.message,
        };
      } else {
        ret.data = data;
      }
      res.json_data = data;
      res.jsonp(ret);
    });
    return;
  }
  if (method === 'getUserInfo') {
    const { jwt_address } = req;
    const ret = {
      success: true,
    };
    if (!jwt_address) {
      ret.success = false;
      ret.error = {
        code: ERROR.LOGIN_FAIL.code,
        message: ERROR.LOGIN_FAIL.message,
      };
    } else {
      ret.data = {
        ...jwt_address.getUser(),
      };
    }
    res.jsonp(ret);
    return;
  }
  if (method === 'getUserAccounts') {
    const { jwt_address } = req;
    const ret = {
      success: true,
    };
    if (!jwt_address) {
      ret.success = false;
      ret.error = {
        code: ERROR.LOGIN_FAIL.code,
        message: ERROR.LOGIN_FAIL.message,
      };
      res.jsonp(ret);
      return;
    }
    getUserAccounts(jwt_address.t).then((list) => {
      ret.data = list;
      res.jsonp(ret);
    });
    return;
  }
  res.jsonp({
    success: false,
    error: {
      code: ERROR.RPC_NO_METHOD.code,
      message: ERROR.RPC_NO_METHOD.message,
    },
  });
});

module.exports = router;
