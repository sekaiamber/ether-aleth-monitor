const express = require('express');
const jwt = require('jwt-simple');
const { Models, commonErrorHandler } = require('../db');
const jwtParser = require('../middlewares/jwtParser');
const argsCheck = require('../middlewares/argsCheck');
const ERROR = require('../const/ERROR.json');
const { getClentIp } = require('../utils');

const router = express.Router();
const { Address } = Models;

function createAddress(req, res, next, phone, password, deviceId, inviter) {
  Address.generate(phone, password, deviceId, inviter).then((address) => {
    res.json_data = {
      ...address.getData(),
    };
    next();
  }).catch(commonErrorHandler.bind(this, req, res, next));
}

router.post('/address.json', argsCheck('phone', 'password', 'deviceId'), (req, res, next) => {
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

router.post('/address/restore.json', (req, res, next) => {
  const { mnemonic, privateKey } = req.body;
  // TODO: 检查参数合法性
  if ((!mnemonic || mnemonic.length === 0) && (!privateKey || privateKey.length === 0)) {
    res.json_error_code = ERROR.RESTORE_ARGS.code;
    res.json_error = ERROR.RESTORE_ARGS.message;
    next();
    return;
  }
  let pk = privateKey;
  if (pk) {
    pk = Address.decodeMaskedKey(pk);
  } else {
    pk = Address.decodeMnemonic(mnemonic.split(' '));
  }
  Address.findOne({ where: { privateKey: pk } }).then((address) => {
    if (!address) {
      res.json_error_code = ERROR.RESTORE_PK_ERR.code;
      res.json_error = ERROR.RESTORE_PK_ERR.message;
      next();
      return;
    }
    res.json_data = {
      ...address.getData(),
    };
    next();
  });
});

module.exports = router;
